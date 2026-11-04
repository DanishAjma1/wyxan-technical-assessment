import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Site, SiteDocument } from './schemas/site.schema';
import { CreateSiteDto } from './dto/site.dto';
import { normalizeAddress } from '../common/address.util';
import { UsersService } from '../users/users.service';

export interface SearchSiteResult extends Site {
  snippet: string;
  score: number;
}

function stripHtmlTags(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function buildSnippet(plainText: string, query: string, maxLength = 200): string {
  if (!plainText) return '';
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0);
  const lower = plainText.toLowerCase();

  let firstMatchIdx = -1;
  for (const term of terms) {
    const idx = lower.indexOf(term);
    if (idx !== -1 && (firstMatchIdx === -1 || idx < firstMatchIdx)) {
      firstMatchIdx = idx;
    }
  }

  if (firstMatchIdx === -1) {
    return plainText.length > maxLength
      ? plainText.slice(0, maxLength).trim() + '...'
      : plainText;
  }

  const start = Math.max(0, firstMatchIdx - 60);
  const end = Math.min(plainText.length, start + maxLength);
  let excerpt = plainText.slice(start, end).trim();
  if (start > 0) excerpt = '...' + excerpt;
  if (end < plainText.length) excerpt = excerpt + '...';
  return excerpt;
}

@Injectable()
export class SitesService {
  constructor(
    @InjectModel(Site.name) private readonly siteModel: Model<SiteDocument>,
    private readonly usersService: UsersService,
  ) {}

  async findAll(): Promise<Site[]> {
    return this.siteModel.find().sort({ createdAt: -1 }).lean().exec();
  }

  async findByAddress(rawAddress: string): Promise<Site> {
    const address = normalizeAddress(rawAddress);
    const site = await this.siteModel.findOne({ address }).lean().exec();
    if (!site) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Nowhere',
        message: `Nothing has been published at "${address}" yet.`,
        address,
      });
    }
    return site;
  }

  async create(dto: CreateSiteDto): Promise<Site> {
    const address = normalizeAddress(dto.address);
    const existing = await this.siteModel.findOne({ address }).lean().exec();
    if (existing) {
      throw new ConflictException({
        statusCode: 409,
        error: 'Conflict',
        message: `The address "${address}" is already registered by ${existing.author}.`,
        address,
      });
    }

    await this.usersService.findOrCreate({ name: dto.author });

    const created = new this.siteModel({
      address,
      title: dto.title.trim(),
      body: dto.body,
      author: dto.author.trim(),
      createdAt: new Date(),
    });

    return (await created.save()).toObject();
  }

  async search(rawQuery: string): Promise<SearchSiteResult[]> {
    const query = rawQuery.trim();
    if (!query) {
      const allSites = await this.findAll();
      return allSites.map((site) => {
        const plainBody = stripHtmlTags(site.body);
        return {
          ...site,
          snippet: buildSnippet(plainBody, ''),
          score: 1,
        };
      });
    }

    // 1. Execute MongoDB full-text search using the text index
    const textMatches = await this.siteModel
      .find(
        { $text: { $search: query } },
        { score: { $meta: 'textScore' } },
      )
      .sort({ score: { $meta: 'textScore' } })
      .lean()
      .exec();

    // 2. Also execute regex search across title, address, and body so substring / prefix queries match reliably
    const escapedTerms = query
      .split(/\s+/)
      .filter(Boolean)
      .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    const regexPattern = new RegExp(escapedTerms.join('|'), 'i');
    const regexMatches = await this.siteModel
      .find({
        $or: [
          { title: regexPattern },
          { address: regexPattern },
          { body: regexPattern },
        ],
      })
      .lean()
      .exec();

    const resultsMap = new Map<string, SearchSiteResult>();

    for (const site of textMatches) {
      const plainBody = stripHtmlTags(site.body);
      const rawScore = (site as Site & { score?: number }).score ?? 1;
      resultsMap.set(site.address, {
        address: site.address,
        title: site.title,
        body: site.body,
        author: site.author,
        createdAt: site.createdAt,
        snippet: buildSnippet(plainBody, query),
        score: rawScore,
      });
    }

    for (const site of regexMatches) {
      if (resultsMap.has(site.address)) continue;

      const plainBody = stripHtmlTags(site.body);
      const titleMatch = regexPattern.test(site.title);
      const addressMatch = regexPattern.test(site.address);
      const plainBodyMatch = regexPattern.test(plainBody);

      // Ignore if it only matched inside an HTML tag attribute and not visible content, title, or address
      if (!titleMatch && !addressMatch && !plainBodyMatch) {
        continue;
      }

      const calculatedScore =
        (titleMatch ? 8 : 0) + (addressMatch ? 4 : 0) + (plainBodyMatch ? 2 : 0);

      resultsMap.set(site.address, {
        address: site.address,
        title: site.title,
        body: site.body,
        author: site.author,
        createdAt: site.createdAt,
        snippet: buildSnippet(plainBody, query),
        score: calculatedScore,
      });
    }

    return Array.from(resultsMap.values()).sort((a, b) => b.score - a.score);
  }
}
