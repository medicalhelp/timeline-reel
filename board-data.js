/* The portfolio board: one lane per cluster, one desktop frame per exploration.
   Each item points at <page>?screen=<id>. "said" is what the exploration does (shown as its title line). */
window.BOARD = {
  title: 'portfolio · explorations',
  subtitle: 'round 1 · desktop · the frames are live, "replay" runs the demo',
  intro: {
    kicker: 'brief',
    title: 'the portfolio as a timeline reel',
    body: [
      'The top 90% plays one short film per project, back to back; the bottom 10% is the timeline of those films, ordered by time, with a playhead. Clicking a clip opens its case study, and the timeline becomes that page’s navigation.',
      'Dark, cinematic, quiet type. Butter-smooth motion on one master clock, measured against the archive intro and Aristide Benoist.',
      'Films are stand-ins recorded from real work; roles and years are still to confirm. Logos from Wikimedia Commons, set in white. Full brief: BRIEF.md.'
    ]
  },
  lanes: [
    {
      id: 'H', kicker: 'cluster H', title: 'home',
      note: 'The first screen: the reel plays, the timeline indexes it, the caption names it. H1 is the reference; H2 and H3 change how much the timeline shows, and when.',
      page: 'home.html',
      items: [
        { id: 'H1', moment: true, title: 'the reel and the timeline', said: 'autoplays · click a clip to jump', why: 'Shows the work moving within a second; the timeline is the career: IKEA, Telekom, Red Bull as long clips with their logos over dimmed frames, two personal projects unnamed · the films carry it, so weak footage shows.' },
        { id: 'H2', moment: true, title: 'frames on approach', said: 'logos at rest · frames rise as the pointer nears', why: 'The reel owns the screen until you reach for the timeline, then the index tells you more · someone who never moves the pointer never sees the frames.' },
        { id: 'H3', moment: true, title: 'the timeline breathes', said: 'hover grows the timeline · the reel gives way', why: 'The frames become readable exactly when you look at them; the reel stays full the rest of the time · the whole screen moves on a hover, so it must stay calm.' }
      ]
    },
    {
      id: 'S', kicker: 'cluster S', title: 'scrubbing',
      note: 'Taking over the reel with the pointer: dragging like an editor, or sampling a clip without leaving the one that plays.',
      page: 'scrub.html',
      items: [
        { id: 'S1', moment: true, title: 'drag to scrub', said: 'drag the playhead · inertia · settles on a clip', why: 'Feels like an editor and samples the whole reel in one gesture · seeking needs keyframe-dense encodes of the real films.' },
        { id: 'S2', moment: true, title: 'hover to preview', said: 'rest on a clip · its film previews · leave returns', why: 'Sample without committing; the reel never loses its place · decodes extra video, and the caption must say which film you see.' }
      ]
    },
    {
      id: 'T', kicker: 'clusters T and C', title: 'into a case study',
      note: 'Two ways to open a case study from a logo, and the case study itself with the timeline at the top as its section navigation (IKEA as the example).',
      page: 'case.html',
      items: [
        { id: 'T1', moment: true, title: 'the reel becomes the hero', said: 'click a logo · the film settles into the hero', why: 'No cut: what you were watching is what you open · the hero keeps the reel’s aspect, which limits art direction at the top.' },
        { id: 'T2', moment: true, title: 'zoom into the clip', said: 'click a logo · the timeline zooms into its sections', why: 'Makes the structure explicit: a project is a stretch of the career, seen up close · the longest move (3 s), with a beat of dark stage.' },
        { id: 'C1', moment: true, title: 'timeline as section navigation', said: 'sections on the timeline · playhead follows the scroll', why: 'One navigation for the whole site: where you are in the story and in the career · a lot to carry in 48 px.' }
      ]
    },
    {
      id: 'K', kicker: 'clusters K and I', title: 'caption and arrival',
      note: 'The lower third that names what plays, and the first three seconds of the site.',
      page: 'caption.html',
      items: [
        { id: 'K1', moment: true, title: 'caption as a lower third', said: 'white logo · project · role, each on its own beat', why: 'The logo is recognised before it is read; the second line names the film you see · logos of different shapes need their own sizes.' },
        { id: 'I1', moment: true, page: 'arrive.html', title: 'first load as one gesture', said: 'name settles · clips draw in · film fades up · playhead starts', why: 'Teaches the layout in reading order (who, the career, the work) · delays the first film by about 1.6 s; return visits need a skip.' }
      ]
    }
  ]
};
