import * as dotenv from 'dotenv';
import { join } from 'path';
import { createHash } from 'crypto';
import mongoose, { Types } from 'mongoose';
import { UserSchema } from './users/schemas/user.schema';
import { SiteSchema } from './sites/schemas/site.schema';
import { VisitSchema, NavigationType } from './history/schemas/visit.schema';

dotenv.config({ path: join(process.cwd(), '.env') });
dotenv.config({ path: join(process.cwd(), '..', '.env') });

function deterministicObjectId(seedKey: string): Types.ObjectId {
  const hex = createHash('md5').update(`wyxan-seed:${seedKey}`).digest('hex').slice(0, 24);
  return new Types.ObjectId(hex);
}

const BASE_TIME = new Date('2026-11-04T05:00:00.000Z');
function minutesAfterStart(mins: number): Date {
  return new Date(BASE_TIME.getTime() + mins * 60 * 1000);
}

const USERS = ['Danish', 'Elena', 'Marcus', 'Sora'];

interface SeedSite {
  address: string;
  title: string;
  author: string;
  createdAt: Date;
  body: string;
}

const SITES: SeedSite[] = [
  {
    address: 'tidepool.zz',
    title: 'Tidepool Directory & Coastal Portal',
    author: 'Danish',
    createdAt: new Date('2026-11-04T09:00:00.000Z'),
    body: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 32px; line-height: 1.6; }
    .container { max-width: 840px; margin: 0 auto; }
    .hero { background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #1d4ed8 100%); padding: 28px; border-radius: 14px; margin-bottom: 28px; box-shadow: 0 10px 25px rgba(14,165,233,0.2); }
    .hero h1 { margin: 0 0 8px 0; font-size: 28px; color: #ffffff; }
    .hero p { margin: 0; color: #e0f2fe; font-size: 15px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; margin-bottom: 28px; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 16px; transition: border-color 0.2s; }
    .card:hover { border-color: #38bdf8; }
    .card a { color: #38bdf8; font-weight: 600; text-decoration: none; font-size: 16px; }
    .card a:hover { text-decoration: underline; }
    .card p { margin: 6px 0 0 0; font-size: 13px; color: #94a3b8; }
    .badge { display: inline-block; font-size: 11px; background: #0f172a; color: #7dd3fc; padding: 2px 8px; border-radius: 999px; margin-top: 8px; }
    .dead-zone { background: rgba(239, 68, 68, 0.1); border: 1px dashed #ef4444; border-radius: 10px; padding: 18px; margin-bottom: 28px; }
    .dead-zone h3 { margin: 0 0 8px 0; color: #fca5a5; font-size: 16px; }
    .dead-zone a { color: #f87171; margin-right: 16px; font-weight: 600; }
    .scratchpad { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 20px; margin-bottom: 28px; }
    .scratchpad h3 { margin-top: 0; color: #f8fafc; }
    input, textarea, select { width: 100%; box-sizing: border-box; background: #0f172a; border: 1px solid #475569; color: #f8fafc; padding: 10px; border-radius: 6px; margin-top: 6px; margin-bottom: 14px; font-family: inherit; }
    .lore { background: #1e293b; border-radius: 10px; padding: 20px; border: 1px solid #334155; }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <h1>🌊 Tidepool.zz — The Micro-Web Portal</h1>
      <p>Welcome to the central index of the .zz archipelago. Follow any internal link below or test state preservation using the field scratchpad.</p>
    </div>

    <h2>Published Archipelago Sites</h2>
    <div class="grid">
      <div class="card">
        <a href="observatory.zz">observatory.zz</a>
        <p>Deep sky radio telemetry, exoplanet transit tables, and orbital logs.</p>
        <span class="badge">By Elena</span>
      </div>
      <div class="card">
        <a href="lantern.zz">lantern.zz</a>
        <p>The Paper Lantern Press — essays on slow computing and hypertext craft.</p>
        <span class="badge">By Marcus</span>
      </div>
      <div class="card">
        <a href="archive.zz">archive.zz</a>
        <p>Historical specifications and packet captures of the early .zz protocol.</p>
        <span class="badge">By Danish</span>
      </div>
      <div class="card">
        <a href="botanica.zz">botanica.zz</a>
        <p>Glasshouse Botanica — bioluminescent moss, rare ferns, and care logs.</p>
        <span class="badge">By Sora</span>
      </div>
      <div class="card">
        <a href="synthwave.zz">synthwave.zz</a>
        <p>Analog modular synthesizer patch sheets and oscillator calibration.</p>
        <span class="badge">By Marcus</span>
      </div>
      <div class="card">
        <a href="recipes.zz">recipes.zz</a>
        <p>Midnight Noodle & Tea Kitchen — broths, chili oils, and oolong infusions.</p>
        <span class="badge">By Sora</span>
      </div>
      <div class="card">
        <a href="gazette.zz">gazette.zz</a>
        <p>The Daily Zz Gazette — neighborhood dispatches and archipelago mysteries.</p>
        <span class="badge">By Elena</span>
      </div>
      <div class="card">
        <a href="cipher.zz">cipher.zz</a>
        <p>Cryptographic puzzles, Caesar shift tools, and numbers station logs.</p>
        <span class="badge">By Danish</span>
      </div>
      <div class="card">
        <a href="weather.zz">weather.zz</a>
        <p>Archipelago Maritime Weather Beacon — tide charts and swell forecasts.</p>
        <span class="badge">By Elena</span>
      </div>
    </div>

    <div class="dead-zone">
      <h3>⚠️ Uncharted / Broken Beacons (Dead Links to Nowhere)</h3>
      <p style="font-size:13px; color:#cbd5e1; margin:0 0 10px 0;">These addresses have gone dark or were never registered. Clicking them tests the browser's 404 "Nowhere" resolution:</p>
      <a href="atlantis.zz">atlantis.zz</a>
      <a href="phantom-reef.zz">phantom-reef.zz</a>
      <a href="lost-signal.zz">lost-signal.zz</a>
      <a href="void-station.zz">void-station.zz</a>
    </div>

    <div class="scratchpad">
      <h3>📝 Explorer Scratchpad (Restore-on-Return Test)</h3>
      <p style="font-size:13px; color:#94a3b8; margin-top:0;">Type notes here, scroll down, click a link above, then press <strong>Back</strong> — your input values and scroll position are automatically preserved!</p>
      <label style="font-size:13px;">Current Expedition Tag</label>
      <input type="text" name="expedition_tag" placeholder="e.g. Northern Reef Survey #42" />
      <label style="font-size:13px;">Favorite Sector</label>
      <select name="favorite_sector">
        <option value="tidepool">Tidepool Hub</option>
        <option value="observatory">Deep Sky Observatory</option>
        <option value="botanica">Glasshouse Botanica</option>
        <option value="synthwave">Modular Synth Studio</option>
      </select>
      <label style="font-size:13px;">Field Observations</label>
      <textarea name="field_notes" rows="4" placeholder="Record your findings across the .zz web..."></textarea>
    </div>

    <div class="lore">
      <h3>Tidepool Ecological Log</h3>
      <p>At low tide, the basalt basins along the northern coast trap pockets of crystal-clear seawater warmed by the afternoon sun. Sea anemones, hermit crabs, and iridescent kelp fronds thrive in this micro-ecosystem.</p>
      <p>Further reading: visit <a href="botanica.zz" style="color:#38bdf8;">botanica.zz</a> for marine flora classification or check <a href="weather.zz" style="color:#38bdf8;">weather.zz</a> for today's low-tide window.</p>
    </div>
  </div>
</body>
</html>`,
  },
  {
    address: 'observatory.zz',
    title: 'Meridian Deep Sky Observatory',
    author: 'Elena',
    createdAt: new Date('2026-11-04T09:06:00.000Z'),
    body: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Courier New', monospace; background: #090d16; color: #a5f3fc; margin: 0; padding: 32px; line-height: 1.6; }
    .wrap { max-width: 820px; margin: 0 auto; }
    header { border-bottom: 1px solid #164e63; padding-bottom: 16px; margin-bottom: 24px; }
    h1 { color: #22d3ee; margin: 0 0 6px 0; }
    nav a { color: #67e8f9; margin-right: 16px; text-decoration: none; }
    nav a:hover { text-decoration: underline; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; background: #0f172a; }
    th, td { border: 1px solid #1e293b; padding: 10px 12px; text-align: left; font-size: 14px; }
    th { background: #164e63; color: #ecfeff; }
    .panel { background: #0f172a; border: 1px solid #155e75; padding: 18px; border-radius: 8px; margin-bottom: 20px; }
    input, textarea { background: #020617; border: 1px solid #0e7490; color: #ecfeff; padding: 8px; width: 100%; box-sizing: border-box; margin-top: 6px; margin-bottom: 12px; }
    .dead { color: #f87171; }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <h1>🔭 Meridian Deep Sky Observatory</h1>
      <p>Array Status: ONLINE | Baseline: 42.8 km | Wavelength: 21 cm Hydrogen Line</p>
      <nav>
        <a href="tidepool.zz">← Back to tidepool.zz</a>
        <a href="archive.zz">archive.zz</a>
        <a href="cipher.zz">cipher.zz</a>
        <a href="weather.zz">weather.zz</a>
        <a href="lost-signal.zz" class="dead">lost-signal.zz (Unverified Beacon)</a>
      </nav>
    </header>

    <div class="panel">
      <h3>Recent Exoplanet Transit Detections</h3>
      <table>
        <thead>
          <tr>
            <th>Target ID</th>
            <th>Right Ascension</th>
            <th>Orbital Period</th>
            <th>Spectroscopy</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>KEPLER-442b</td>
            <td>19h 01m 27s</td>
            <td>112.3 days</td>
            <td>Water vapor & silicate cloud signature</td>
          </tr>
          <tr>
            <td>TRAPPIST-1e</td>
            <td>23h 06m 29s</td>
            <td>6.10 days</td>
            <td>Nitrogen-dominated temperate atmosphere</td>
          </tr>
          <tr>
            <td>VELA-PULSAR-9</td>
            <td>08h 35m 20s</td>
            <td>0.089 sec</td>
            <td>Synchrotron emission burst logged</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="panel">
      <h3>Telescope Calibration Console</h3>
      <label>Target Coordinates (RA / Dec)</label>
      <input type="text" name="ra_dec" placeholder="e.g. 19h 01m / +39° 16'" />
      <label>Integration Exposure (Seconds)</label>
      <input type="number" name="exposure_sec" placeholder="120" />
      <label>Observer Telemetry Log</label>
      <textarea name="telemetry_log" rows="3" placeholder="Enter anomalous radio burst notes..."></textarea>
    </div>

    <div class="panel">
      <h3>Anomalous Fast Radio Burst Archive</h3>
      <p>At 03:14 UTC, Dish #4 recorded a narrowband pulse originating near the Cygnus rift. Cross-referencing with <a href="cipher.zz" style="color:#38bdf8;">cipher.zz</a> suggests a prime-number harmonic interval. Full raw packet dumps are mirrored on <a href="archive.zz" style="color:#38bdf8;">archive.zz</a>, though the relay at <a href="lost-signal.zz" class="dead">lost-signal.zz</a> remains unreachable.</p>
    </div>
  </div>
</body>
</html>`,
  },
  {
    address: 'lantern.zz',
    title: 'The Paper Lantern Press',
    author: 'Marcus',
    createdAt: new Date('2026-11-04T09:12:00.000Z'),
    body: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; background: #fefce8; color: #292524; margin: 0; padding: 36px; line-height: 1.75; }
    article { max-width: 680px; margin: 0 auto; background: #fffbeb; padding: 32px 40px; border: 1px solid #fde68a; border-radius: 8px; box-shadow: 0 4px 16px rgba(180,83,9,0.06); }
    h1 { font-size: 30px; color: #78350f; margin-top: 0; }
    .meta { font-style: italic; color: #92400e; margin-bottom: 24px; border-bottom: 1px solid #fde68a; padding-bottom: 12px; }
    a { color: #b45309; font-weight: bold; }
    blockquote { border-left: 3px solid #d97706; padding-left: 16px; color: #57534e; font-style: italic; margin: 20px 0; }
    .margin-note { background: #fef3c7; padding: 16px; border-radius: 6px; margin-top: 24px; }
    input, textarea { width: 100%; box-sizing: border-box; padding: 8px; border: 1px solid #d97706; background: #ffffff; border-radius: 4px; margin-top: 6px; margin-bottom: 12px; font-family: inherit; }
  </style>
</head>
<body>
  <article>
    <h1>🏮 The Paper Lantern Press</h1>
    <div class="meta">Issue No. 14 • Edited by Marcus • Connected to <a href="tidepool.zz">tidepool.zz</a></div>

    <h2>In Praise of Small, Handcrafted Webs</h2>
    <p>Before algorithmic feeds flattened the digital landscape into an endless river of identical cards, the web was an archipelago of quirky, handcrafted rooms. Every page reflected the temperament of its builder—from botanical notebooks like <a href="botanica.zz">botanica.zz</a> to community broadsheets like <a href="gazette.zz">gazette.zz</a>.</p>

    <blockquote>"A hyperlink is an act of hospitality: a doorway cut into the wall of your own study that opens directly onto a neighbor's garden."</blockquote>

    <p>When you publish a page on the .zz network, you aren't chasing engagement metrics. You are leaving a lantern lit in the window for fellow travelers.</p>

    <p>Some older volumes from our sister annex at <a href="ghost-library.zz">ghost-library.zz</a> have vanished into Nowhere, though our technical preservation team at <a href="archive.zz">archive.zz</a> continues to catalog surviving manuscripts.</p>

    <div class="margin-note">
      <h3 style="margin-top:0;">Reader's Margin Annotation</h3>
      <label>Your Favorite Passage</label>
      <input type="text" name="passage_quote" placeholder="Quote a line or note a page number..." />
      <label>Personal Reflection</label>
      <textarea name="reader_reflection" rows="3" placeholder="Write your margin notes here..."></textarea>
    </div>
  </article>
</body>
</html>`,
  },
  {
    address: 'archive.zz',
    title: 'Zz-Net Protocol & Historical Archive',
    author: 'Danish',
    createdAt: new Date('2026-11-04T09:18:00.000Z'),
    body: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, sans-serif; background: #18181b; color: #e4e4e7; margin: 0; padding: 32px; line-height: 1.6; }
    .container { max-width: 800px; margin: 0 auto; }
    .header { background: #27272a; padding: 20px 24px; border-left: 4px solid #10b981; border-radius: 6px; margin-bottom: 24px; }
    h1 { margin: 0 0 6px 0; color: #34d399; font-size: 24px; }
    .spec-box { background: #27272a; border: 1px solid #3f3f46; padding: 18px; border-radius: 8px; margin-bottom: 18px; }
    code { background: #09090b; color: #6ee7b7; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
    a { color: #34d399; }
    input { background: #09090b; border: 1px solid #52525b; color: #f4f4f5; padding: 8px 12px; border-radius: 4px; width: 100%; box-sizing: border-box; margin-top: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏛️ Zz-Net Protocol & Historical Archive</h1>
      <p style="margin:0; font-size:14px; color:#a1a1aa;">Curated by Danish • Return to <a href="tidepool.zz">tidepool.zz</a></p>
    </div>

    <div class="spec-box">
      <h3>RFC-001: Custom Address Resolution Engine</h3>
      <p>Unlike legacy DNS hierarchies, the <code>.zz</code> namespace resolves human-memorable identifiers directly against the distributed document store. Valid pages render inside an isolated sandbox, while unregistered addresses resolve cleanly to the <strong>Nowhere (404)</strong> state.</p>
      <p>Related technical implementations can be inspected at <a href="observatory.zz">observatory.zz</a>, <a href="synthwave.zz">synthwave.zz</a>, and <a href="cipher.zz">cipher.zz</a>.</p>
    </div>

    <div class="spec-box">
      <h3>Decommissioned Nodes</h3>
      <p>Historical records indicate that <a href="void-station.zz">void-station.zz</a> and <a href="atlantis.zz">atlantis.zz</a> were experimental relay nodes that never completed registration. Navigating to them demonstrates graceful broken-link handling.</p>
    </div>

    <div class="spec-box">
      <h3>Archive Microfiche Accession Lookup</h3>
      <label>Accession Reference Number</label>
      <input type="text" name="accession_ref" placeholder="e.g. ZZ-ARC-1998-04" />
    </div>
  </div>
</body>
</html>`,
  },
  {
    address: 'botanica.zz',
    title: 'Glasshouse Botanica & Flora Atlas',
    author: 'Sora',
    createdAt: new Date('2026-11-04T09:24:00.000Z'),
    body: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, sans-serif; background: #052e16; color: #dcfce7; margin: 0; padding: 32px; line-height: 1.6; }
    .wrap { max-width: 800px; margin: 0 auto; }
    .banner { background: #14532d; border: 1px solid #22c55e; padding: 24px; border-radius: 12px; margin-bottom: 24px; }
    h1 { margin: 0 0 8px 0; color: #86efac; }
    .specimen { background: #064e3b; border: 1px solid #047857; border-radius: 10px; padding: 18px; margin-bottom: 16px; }
    .specimen h3 { margin-top: 0; color: #6ee7b7; }
    a { color: #86efac; font-weight: 600; }
    input, textarea { width: 100%; box-sizing: border-box; padding: 8px; background: #022c22; border: 1px solid #10b981; color: #ecfdf5; border-radius: 6px; margin-top: 6px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="banner">
      <h1>🌿 Glasshouse Botanica & Flora Atlas</h1>
      <p style="margin:0;">Maintained by Sora • Humidity: 78% • Temp: 23°C • <a href="tidepool.zz">tidepool.zz</a> | <a href="recipes.zz">recipes.zz</a> | <a href="lantern.zz">lantern.zz</a></p>
    </div>

    <div class="specimen">
      <h3>1. Schistostega pennata (Luminous Cave Moss)</h3>
      <p>Also known as Goblin's Gold, this delicate moss refracts faint ambient light through spherical protonemal cells, casting an emerald glow across volcanic sea caves near <a href="tidepool.zz">tidepool.zz</a>.</p>
    </div>

    <div class="specimen">
      <h3>2. Camellia sinensis var. oolong (High-Mountain Tea Cultivar)</h3>
      <p>Grown on mist-shrouded terraces at 1,600 meters. Leaves harvested from Conservatory Bay 3 are roasted and steeped in the culinary guides on <a href="recipes.zz">recipes.zz</a>.</p>
    </div>

    <div class="specimen">
      <h3>3. Nepenthes rajah (Giant Montane Pitcher Plant)</h3>
      <p>Requires rainwater misting twice daily; check precipitation forecasts at <a href="weather.zz">weather.zz</a> before opening the roof vents.</p>
    </div>

    <div class="specimen">
      <h3>Greenhouse Care & Mist Log</h3>
      <label>Cultivar Watered Today</label>
      <input type="text" name="cultivar_name" placeholder="e.g. Luminous Cave Moss - Tray B" />
      <label>Soil pH & Moisture Notes</label>
      <textarea name="moisture_notes" rows="3" placeholder="Record humidity and leaf emergence..."></textarea>
    </div>
  </div>
</body>
</html>`,
  },
  {
    address: 'synthwave.zz',
    title: 'Polyphonic Analog Synth & Patch Bay Studio',
    author: 'Marcus',
    createdAt: new Date('2026-11-04T09:30:00.000Z'),
    body: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, sans-serif; background: #1e1b4b; color: #e0e7ff; margin: 0; padding: 32px; line-height: 1.6; }
    .studio { max-width: 800px; margin: 0 auto; }
    .rack { background: #312e81; border: 2px solid #818cf8; border-radius: 12px; padding: 22px; margin-bottom: 20px; box-shadow: 0 8px 20px rgba(0,0,0,0.35); }
    h1 { margin: 0 0 8px 0; color: #f472b6; }
    a { color: #38bdf8; font-weight: 600; margin-right: 14px; }
    .controls { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 12px; }
    .ctrl { background: #1e1b4b; padding: 12px; border-radius: 8px; border: 1px solid #4f46e5; }
    input[type="text"], select { width: 100%; box-sizing: border-box; background: #0f172a; color: #fff; border: 1px solid #6366f1; padding: 8px; border-radius: 4px; margin-top: 6px; }
  </style>
</head>
<body>
  <div class="studio">
    <div class="rack">
      <h1>🎛️ Polyphonic Analog Synth & Patch Bay</h1>
      <p>Sound designer: Marcus • Links: <a href="tidepool.zz">tidepool.zz</a> <a href="archive.zz">archive.zz</a> <a href="cipher.zz">cipher.zz</a></p>
      <p>Adjust the patch parameters below, navigate to another site, and press <strong>Back</strong> to verify your synth patch settings remain intact.</p>
    </div>

    <div class="rack">
      <h3>Patch Memory #07: "Submarine Horizon Pad"</h3>
      <div class="controls">
        <div class="ctrl">
          <label>Patch Name</label>
          <input type="text" name="patch_name" placeholder="Submarine Horizon v2" />
        </div>
        <div class="ctrl">
          <label>Oscillator 1 Waveform</label>
          <select name="osc1_waveform">
            <option value="sawtooth">Sawtooth (Warm Brass)</option>
            <option value="pulse">Pulse Width 35%</option>
            <option value="triangle">Triangle Sub</option>
          </select>
        </div>
        <div class="ctrl">
          <label>Low-Pass Filter Cutoff (Hz)</label>
          <input type="text" name="filter_cutoff" placeholder="840 Hz / 24dB Ladder" />
        </div>
        <div class="ctrl">
          <label>Chorus & Tape Delay Mix</label>
          <input type="text" name="delay_mix" placeholder="380ms dotted eighth, 45% wet" />
        </div>
      </div>
    </div>
  </div>
</body>
</html>`,
  },
  {
    address: 'recipes.zz',
    title: 'Midnight Noodle & Tea Kitchen',
    author: 'Sora',
    createdAt: new Date('2026-11-04T09:36:00.000Z'),
    body: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, sans-serif; background: #27171c; color: #fce7f3; margin: 0; padding: 32px; line-height: 1.65; }
    .kitchen { max-width: 780px; margin: 0 auto; }
    .card { background: #3b1d26; border: 1px solid #be185d; border-radius: 12px; padding: 22px; margin-bottom: 20px; }
    h1 { margin: 0 0 8px 0; color: #f9a8d4; }
    h3 { margin-top: 0; color: #fbcfe8; }
    a { color: #f472b6; font-weight: 600; }
    input, textarea { width: 100%; box-sizing: border-box; background: #1f1015; border: 1px solid #db2777; color: #fdf2f8; padding: 8px; border-radius: 6px; margin-top: 6px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="kitchen">
    <div class="card">
      <h1>🍜 Midnight Noodle & Tea Kitchen</h1>
      <p>By Sora • Fresh herbs sourced from <a href="botanica.zz">botanica.zz</a> • Featured in <a href="gazette.zz">gazette.zz</a> • Hub: <a href="tidepool.zz">tidepool.zz</a></p>
    </div>

    <div class="card">
      <h3>Smoky Kombu & Shiitake Midnight Ramen</h3>
      <ul>
        <li>4 cups cold spring water steeped with Rishiri kombu and dried shiitake caps</li>
        <li>2 tbsp roasted white miso paste whisked with toasted sesame oil</li>
        <li>1 tsp crispy chili oil infused with star anise and Sichuan peppercorns</li>
        <li>Fresh alkaline wheat noodles boiled for 90 seconds</li>
      </ul>
    </div>

    <div class="card">
      <h3>Cold-Brewed High Mountain Oolong</h3>
      <p>Steep 12g of rolled oolong leaves from <a href="botanica.zz">botanica.zz</a> in 1 liter of filtered water overnight. Produces a fragrant amber liquor with orchid and roasted peach notes.</p>
    </div>

    <div class="card">
      <h3>Chef's Tasting Modification Notes</h3>
      <label>Spice Level & Broth Adjustment</label>
      <input type="text" name="spice_adjustment" placeholder="e.g. Extra chili crisp, half-salt tare" />
      <label>Tasting Notes</label>
      <textarea name="tasting_notes" rows="3" placeholder="Write your recipe modifications..."></textarea>
    </div>
  </div>
</body>
</html>`,
  },
  {
    address: 'gazette.zz',
    title: 'The Daily Zz Gazette',
    author: 'Elena',
    createdAt: new Date('2026-11-04T09:42:00.000Z'),
    body: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Georgia, serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 32px; line-height: 1.65; }
    .paper { max-width: 820px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; padding: 32px; border-radius: 6px; }
    .masthead { text-align: center; border-bottom: 3px double #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
    .masthead h1 { margin: 0; font-size: 34px; letter-spacing: 1px; }
    .story { margin-bottom: 24px; padding-bottom: 18px; border-bottom: 1px solid #e2e8f0; }
    a { color: #2563eb; font-weight: bold; }
    .broken { color: #dc2626; }
    input { width: 100%; box-sizing: border-box; padding: 8px; border: 1px solid #94a3b8; border-radius: 4px; margin-top: 6px; }
  </style>
</head>
<body>
  <div class="paper">
    <div class="masthead">
      <h1>📰 THE DAILY ZZ GAZETTE</h1>
      <p style="margin:6px 0 0 0; font-size:14px; color:#475569;">Archipelago Morning Edition • Edited by Elena • Directory: <a href="tidepool.zz">tidepool.zz</a></p>
    </div>

    <div class="story">
      <h2>Whatever Happened to the Atlantis Node?</h2>
      <p>Travelers attempting to reach <a href="atlantis.zz" class="broken">atlantis.zz</a> or <a href="phantom-reef.zz" class="broken">phantom-reef.zz</a> this week were greeted by the browser's unmistakable <em>Nowhere (404)</em> screen. Archivist Danish at <a href="archive.zz">archive.zz</a> confirmed that neither address was ever claimed in the central registry—meaning any citizen can still publish a new site there!</p>
    </div>

    <div class="story">
      <h2>Culture & Science Highlights</h2>
      <p>Marcus released Issue #14 of <a href="lantern.zz">lantern.zz</a> alongside a new submarine pad patch on <a href="synthwave.zz">synthwave.zz</a>. Meanwhile, Sora's late-night ramen recipe on <a href="recipes.zz">recipes.zz</a> has become the favorite fuel for astronomers pulling night shifts at <a href="observatory.zz">observatory.zz</a>.</p>
    </div>

    <div>
      <h3>Letters to the Editor</h3>
      <label>Submit a Headline Tip</label>
      <input type="text" name="headline_tip" placeholder="e.g. Bioluminescent tide spotted near Sector 4" />
    </div>
  </div>
</body>
</html>`,
  },
  {
    address: 'cipher.zz',
    title: 'Cryptographic Puzzles & Numbers Station',
    author: 'Danish',
    createdAt: new Date('2026-11-04T09:48:00.000Z'),
    body: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Courier New', monospace; background: #020617; color: #4ade80; margin: 0; padding: 32px; line-height: 1.6; }
    .terminal { max-width: 780px; margin: 0 auto; background: #090d16; border: 1px solid #22c55e; padding: 24px; border-radius: 8px; }
    h1 { margin-top: 0; color: #86efac; }
    a { color: #38bdf8; }
    .cipher-block { background: #052e16; padding: 14px; border-radius: 6px; font-weight: bold; letter-spacing: 2px; margin: 16px 0; color: #bbf7d0; }
    input, textarea { width: 100%; box-sizing: border-box; background: #020617; border: 1px solid #22c55e; color: #4ade80; padding: 8px; font-family: inherit; margin-top: 6px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="terminal">
    <h1>🔐 Cipher.zz — Numbers Station & Puzzle Node</h1>
    <p>Operator: Danish • Connected relays: <a href="tidepool.zz">tidepool.zz</a> | <a href="observatory.zz">observatory.zz</a> | <a href="archive.zz">archive.zz</a> | Dead relay: <a href="lost-signal.zz" style="color:#f87171;">lost-signal.zz</a></p>

    <h3>Challenge #01: Shortwave Intercept (ROT-13 / Caesar)</h3>
    <div class="cipher-block">GUR GVRKCBBY JRO VF N YVIVAT NEPUVCRYNTB</div>
    <p>Hint: Shift each letter by 13 positions to reveal the passphrase transmitted from <a href="observatory.zz">observatory.zz</a>.</p>

    <h3>Decryption Workbench</h3>
    <label>Candidate Shift Key</label>
    <input type="text" name="shift_key" placeholder="ROT-13" />
    <label>Decoded Plaintext Scratchpad</label>
    <textarea name="decoded_plaintext" rows="3" placeholder="Type your decrypted plaintext here..."></textarea>
  </div>
</body>
</html>`,
  },
  {
    address: 'weather.zz',
    title: 'Archipelago Maritime Weather Beacon',
    author: 'Elena',
    createdAt: new Date('2026-11-04T09:54:00.000Z'),
    body: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, sans-serif; background: #0c4a6e; color: #f0f9ff; margin: 0; padding: 32px; line-height: 1.6; }
    .station { max-width: 800px; margin: 0 auto; }
    .panel { background: #075985; border: 1px solid #38bdf8; border-radius: 10px; padding: 20px; margin-bottom: 18px; }
    h1 { margin: 0 0 8px 0; color: #e0f2fe; }
    a { color: #7dd3fc; font-weight: 600; margin-right: 12px; }
    input { width: 100%; box-sizing: border-box; padding: 8px; background: #082f49; border: 1px solid #38bdf8; color: #fff; border-radius: 6px; margin-top: 6px; }
  </style>
</head>
<body>
  <div class="station">
    <div class="panel">
      <h1>⛵ Archipelago Maritime Weather Beacon</h1>
      <p>Meteorologist: Elena • Links: <a href="tidepool.zz">tidepool.zz</a> <a href="observatory.zz">observatory.zz</a> <a href="botanica.zz">botanica.zz</a> <a href="phantom-reef.zz" style="color:#fca5a5;">phantom-reef.zz (Offline Buoy)</a></p>
    </div>

    <div class="panel">
      <h3>Current Synoptic Conditions</h3>
      <ul>
        <li><strong>Barometric Pressure:</strong> 1018.4 hPa (Steady)</li>
        <li><strong>Swell & Tide:</strong> 1.4m WNW swell @ 11s • Low tide at 16:40 local</li>
        <li><strong>Night Sky Transparency:</strong> 94% clear for <a href="observatory.zz">observatory.zz</a></li>
      </ul>
    </div>

    <div class="panel">
      <h3>Buoy Observer Log</h3>
      <label>Wind Gust Reading (Knots)</label>
      <input type="text" name="wind_knots" placeholder="e.g. 14 kts NNW" />
    </div>
  </div>
</body>
</html>`,
  },
];

interface SeedVisit {
  userId: string;
  address: string;
  minutesOffset: number;
  navigationType: NavigationType;
}

// 1 full hour (0..60 minutes) of deterministic initial browsing history across users
const VISITS: SeedVisit[] = [
  // Danish's 1-hour browsing history
  { userId: 'Danish', address: 'tidepool.zz', minutesOffset: 0, navigationType: 'typed' },
  { userId: 'Danish', address: 'observatory.zz', minutesOffset: 4, navigationType: 'link' },
  { userId: 'Danish', address: 'cipher.zz', minutesOffset: 9, navigationType: 'link' },
  { userId: 'Danish', address: 'observatory.zz', minutesOffset: 14, navigationType: 'back' },
  { userId: 'Danish', address: 'cipher.zz', minutesOffset: 17, navigationType: 'forward' },
  { userId: 'Danish', address: 'archive.zz', minutesOffset: 23, navigationType: 'link' },
  { userId: 'Danish', address: 'atlantis.zz', minutesOffset: 29, navigationType: 'link' },
  { userId: 'Danish', address: 'archive.zz', minutesOffset: 31, navigationType: 'back' },
  { userId: 'Danish', address: 'synthwave.zz', minutesOffset: 38, navigationType: 'link' },
  { userId: 'Danish', address: 'recipes.zz', minutesOffset: 46, navigationType: 'typed' },
  { userId: 'Danish', address: 'botanica.zz', minutesOffset: 52, navigationType: 'link' },
  { userId: 'Danish', address: 'tidepool.zz', minutesOffset: 60, navigationType: 'link' },

  // Elena's browsing history
  { userId: 'Elena', address: 'observatory.zz', minutesOffset: 2, navigationType: 'typed' },
  { userId: 'Elena', address: 'weather.zz', minutesOffset: 11, navigationType: 'link' },
  { userId: 'Elena', address: 'phantom-reef.zz', minutesOffset: 19, navigationType: 'link' },
  { userId: 'Elena', address: 'weather.zz', minutesOffset: 21, navigationType: 'back' },
  { userId: 'Elena', address: 'gazette.zz', minutesOffset: 35, navigationType: 'typed' },
  { userId: 'Elena', address: 'lantern.zz', minutesOffset: 49, navigationType: 'link' },
  { userId: 'Elena', address: 'tidepool.zz', minutesOffset: 58, navigationType: 'link' },

  // Marcus's browsing history
  { userId: 'Marcus', address: 'lantern.zz', minutesOffset: 5, navigationType: 'typed' },
  { userId: 'Marcus', address: 'botanica.zz', minutesOffset: 16, navigationType: 'link' },
  { userId: 'Marcus', address: 'lantern.zz', minutesOffset: 25, navigationType: 'back' },
  { userId: 'Marcus', address: 'synthwave.zz', minutesOffset: 40, navigationType: 'typed' },
  { userId: 'Marcus', address: 'tidepool.zz', minutesOffset: 55, navigationType: 'link' },

  // Sora's browsing history
  { userId: 'Sora', address: 'botanica.zz', minutesOffset: 8, navigationType: 'typed' },
  { userId: 'Sora', address: 'recipes.zz', minutesOffset: 22, navigationType: 'link' },
  { userId: 'Sora', address: 'gazette.zz', minutesOffset: 37, navigationType: 'link' },
  { userId: 'Sora', address: 'tidepool.zz', minutesOffset: 57, navigationType: 'link' },
];

async function runSeed() {
  const uri =
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wyxan_mini_browser';

  console.log(`Connecting to MongoDB at ${uri}...`);
  await mongoose.connect(uri);

  const UserModel = mongoose.model('User', UserSchema);
  const SiteModel = mongoose.model('Site', SiteSchema);
  const VisitModel = mongoose.model('Visit', VisitSchema);

  // Idempotent reset + deterministic insertion with fixed ObjectIds
  await Promise.all([
    UserModel.deleteMany({}),
    SiteModel.deleteMany({}),
    VisitModel.deleteMany({}),
  ]);

  const userDocs = USERS.map((name) => ({
    _id: deterministicObjectId(`user:${name.toLowerCase()}`),
    name,
  }));
  await UserModel.insertMany(userDocs);

  const siteDocs = SITES.map((site) => ({
    _id: deterministicObjectId(`site:${site.address}`),
    address: site.address,
    title: site.title,
    body: site.body,
    author: site.author,
    createdAt: site.createdAt,
  }));
  await SiteModel.insertMany(siteDocs);
  await SiteModel.syncIndexes();

  const visitDocs = VISITS.map((v, idx) => ({
    _id: deterministicObjectId(
      `visit:${idx}:${v.userId}:${v.address}:${v.minutesOffset}`,
    ),
    userId: v.userId,
    address: v.address,
    timestamp: minutesAfterStart(v.minutesOffset),
    navigationType: v.navigationType,
  }));
  await VisitModel.insertMany(visitDocs);
  await VisitModel.syncIndexes();

  console.log(
    `✅ Deterministic seed complete: ${userDocs.length} users, ${siteDocs.length} sites, ${visitDocs.length} history visits.`,
  );

  await mongoose.disconnect();
}

runSeed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
