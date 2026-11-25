/* The portfolio board: one lane per cluster, one desktop frame per exploration.
   Each item points at <page>?screen=<id>. "said" is what the exploration does (shown as its title line). */
window.BOARD = {
  title: 'portfolio · explorations',
  subtitle: 'round 1, updated with the real reel · desktop · the frames are live, "replay" runs the demo',
  intro: {
    kicker: 'brief',
    title: 'the portfolio as a timeline reel',
    body: [
      'The top 90% plays one short film per project, back to back; the bottom 10% is the timeline of those films, ordered by time, with a playhead. Clicking a clip opens its case study, and the timeline becomes that page’s navigation.',
      'Dark, cinematic, quiet type. Butter-smooth motion on one master clock, measured against the archive intro and Aristide Benoist.',
      'The reel is the real Reel 2025 (one continuous film, its title card inverted to white on black). Clips are in the reel’s own order; each brand’s logo shows once, hovering a clip lights its brand across the timeline in the brand colour and fades the rest. No captions. Roles and years are still to confirm. Logos from Wikimedia Commons, set in white. Full brief: BRIEF.md.'
    ]
  },
  lanes: [
    {
      id: 'H', kicker: 'cluster H', title: 'home',
      note: 'The first screen: the reel plays and the timeline indexes it. H1 is the reference; H2 and H3 change how much the timeline shows, and when.',
      page: 'home.html',
      items: [
        { id: 'H1', moment: true, title: 'the reel and the timeline', said: 'autoplays · click a clip to jump', why: 'Shows the work moving within a second; the timeline is the reel: title card, IKEA, Disney+, Telekom, Red Bull, one personal clip, then Telekom, IKEA and Telekom again, each brand’s logo once over dimmed frames · the films carry it, so weak footage shows.' },
        { id: 'H2', moment: true, title: 'frames on approach', said: 'logos at rest · frames rise as the pointer nears', why: 'The reel owns the screen until you reach for the timeline, then the index tells you more · someone who never moves the pointer never sees the frames.' },
        { id: 'H3', moment: true, title: 'the timeline breathes', said: 'hover grows the timeline · the reel gives way', why: 'The frames become readable exactly when you look at them; the reel stays full the rest of the time · the whole screen moves on a hover, so it must stay calm.' }
      ]
    },
    {
      id: 'S', kicker: 'cluster S', title: 'scrubbing',
      note: 'Taking over the reel with the pointer: dragging like an editor, or sampling a clip without leaving the one that plays.',
      page: 'scrub.html',
      items: [
        { id: 'S1', moment: true, title: 'drag to scrub', said: 'drag the playhead · inertia · settles on a clip', why: 'Feels like an editor and samples the whole reel in one gesture · seeking needs the keyframe-dense encode of the reel (one every 16 frames).' },
        { id: 'S2', moment: true, title: 'hover to preview', said: 'rest on a clip · its film previews · leave returns', why: 'Sample without committing; the reel never loses its place · decodes extra video, and only the outlined clip says where you are.' }
      ]
    },
    {
      id: 'T', kicker: 'clusters T and C', title: 'into a case study',
      note: 'Two ways to open a case study from a logo, and the case study itself with the timeline at the top as its section navigation (the first IKEA clip as the example).',
      page: 'case.html',
      items: [
        { id: 'T1', moment: true, title: 'the reel becomes the hero', said: 'click a clip · the film settles into the hero', why: 'No cut, and the title rises under it · the hero keeps the reel’s aspect, which limits art direction at the top.' },
        { id: 'T2', moment: true, title: 'zoom into the clip', said: 'click a clip · the timeline zooms into its sections', why: 'Makes the structure explicit: a project is a stretch of the career, seen up close · the longest move (2.2 s); the reel steps back to 25 % while the strip performs.' },
        { id: 'C1', moment: true, title: 'timeline as section navigation', said: 'sections on the timeline · playhead follows the scroll', why: 'One navigation for the whole site: where you are in the story and in the career · a lot to carry in 48 px.' }
      ]
    },
    {
      id: 'K', kicker: 'clusters K and I', title: 'change and arrival',
      note: 'How a project change is signalled with no caption, and the first three seconds of the site.',
      page: 'caption.html',
      items: [
        { id: 'K1', moment: true, title: 'a change, by the timeline alone', said: 'brand bar swells · colour washes along the clip · ring leaves the playhead', why: 'The cut is felt without a word and the film is never touched · it relies on colour, so the title card and the personal clip can only answer in white.' },
        { id: 'I1', moment: true, page: 'arrive.html', title: 'first load as one gesture', said: 'name settles · clips draw in · film fades up · playhead starts', why: 'Teaches the layout in reading order (who, the career, the work) · delays the first film by about 1.1 s; return visits need a skip.' }
      ]
    }
  ]
};
