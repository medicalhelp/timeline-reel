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
      note: 'The first screen: the reel plays, the timeline indexes it, the caption names it. H1 is the reference for the round.',
      page: 'home.html',
      items: [
        { id: 'H1', moment: true, title: 'the reel and the timeline', said: 'autoplays · click a clip to jump', why: 'Shows the work moving within a second; the timeline is the career: IKEA, Telekom, Red Bull as long clips with their logos over dimmed frames, two personal projects unnamed · the films carry it, so weak footage shows.' }
      ]
    }
  ]
};
