# Project Background

I'm a new drummer. I'm currently taking drum lessons as well as playing once or twice a month on our church's worship team. Because of this, I'm frequently writing out drum beats, notes about certain song sections, practice exercises, etc. This can be quite cumbersome as my current solution is very finicky and slow.

# Current Solution

My solution for worship song charts and notes at the moment is to create documents using OnlyOffice's word processor. I have a very specific template that I start out with that contains custom paragraph styles for everything I need to write out. For the charts, I'm using very specifically formatted tables that I'm creating a "groove grid" with. The grids are typically for a single measure, maybe two. I populate the grids with a set of custom symbols I created to represent different types of drum hits.

I currently have no solution for practice exercises. Those are just written on paper.

# Proposal

I would like to build a web app (and maybe some day a mobile app) that is tailored to my needs as a drummer. Ideally, the following general features would be available:

- The ability to create different types of charts:
  - Practice exercises
  - Full song charts
  - Pattern library items (formerly "groove snippets")
- The ability to represent my grooves as either:
  - A grid like I'm currently doing
  - Drum notation on a staff
- Tagging. Here are a couple examples:
  - Tagging practice exercises as "speed" and "kick"
  - Tagging songs as "worship" or "rock"
- The ability to edit grooves inline
- A stretch goal would be the ability to play the grooves created in the grid or drum staff
- It should be user-based, so when I log in, I should see my library of charts, my tags, etc.
- Sharing Model: The app uses a "public" and "private" model for charts and pattern library items:
  - Users can mark an item as "private" if they don't want other users to be able to search for it or see it.
  - Users can leave an item "public" and set permission levels:
    - **Read-only**: Other users can read, print, and copy (clone) the item to their personal library to make modifications.
    - **Edit**: Other users can read and directly make edits, with a concept of edit history and the ability to still create personal clones.
- There should be excellent printing support. Charts should be printable on standard US Letter-sized paper
- We should be able to export to PDF
- As mentioned earlier, I'd like to have support for a **pattern library**.
  - Easily accessible patterns that can be imported into songs, charts, practice exercises, etc.
  - It would be nice to be able to play a pattern to preview it.
  - They should be searchable by tag, title, etc.
  - They should be filterable by time signature, music style, tags, etc.

# Technical Considerations

- There would obviously need to be both a frontend and backend server component
- I want to write this in a modern, flexible framework
  - Next.js seems like a decent choice, although I'm open to feedback on that
  - I'm not super familiar with Typescript, but it seems to be the direction that everybody is going, so I'm open to it
  - I want a modern UI
- I want a good, modern test framework with comprehensive coverage
- I want to ensure best practices are followed, especially for
  - Testing
  - Code quality and linting
  - Code organization
  - Project organization (directory structure, etc.)
- I prefer readability over terseness
- I'll provide my current song template, as well as an example song chart
- I'll provide my spreadsheet of drum symbols
- It might make sense to start out supporting only grids, and add the staff notation as a v2 feature
- It sounds like VexFlow is an option for a staff notation library
- The data should be stored in a standardized format (JSON?)

# References and Links

- [Song Chart Template](./resources/song-chart-template.md)
- [Drum Symbols Guide](./resources/drum-symbols-guide.md)
- ["Have It All" Example Song Chart](./resources/example-have-it-all.md)
- ["Center" Example Song Chart](./resources/example-center.md)
- [Resources README](./resources/README.md)

# Conclusion

This is just an initial requirements and planning doc. The feature set, tech stack, and implementation is not limited to what's in this document. I'm open to suggestions, comments, feedback, etc.

This will initially just be an at-home tool for me and my son to use. However, if other people express interest, I wouldn't mind making the tool public and charging for it as a side project. So please keep that in mind during all phases (planning, architecture, and implementation).
