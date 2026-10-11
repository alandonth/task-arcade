# Force of Focus update

## Publish through your existing GitHub repository

1. Extract `Force_of_Focus_Update.zip`.
2. Open your existing **task-arcade** GitHub repository, then **Add file → Upload files**.
3. Upload the included **public**, **src**, and **tests** folders, plus **package.json**. Upload their contents at the repository root, preserving the folders. Commit to **main**.
4. Wait for Cloudflare's automatic build and deployment to succeed.
5. Refresh the app. For the installed PWA, close and reopen it, then refresh if the previous name is still displayed. An existing home-screen label may need to be renamed manually or the shortcut re-added.

**Keep your existing wrangler.jsonc unchanged.** This update does not include or replace it. Do not create another Worker or database. No SQL or database migrations are needed.

The display name and installation icon change to **Force of Focus**. Existing sessions, profiles, tasks, completed-task counts, animal outfits, points, power balances, and high scores remain compatible. Technical keys, cookie names, existing theme IDs, and the Cloudflare project name remain unchanged deliberately.

## What changed

- Teal, grey/charcoal and metallic-gold styling; gold lightning branding.
- Retro arcade cabinets replace the island map.
- Arcade power is called **Force**. Finishing tasks generates Force; playing consumes it. A powerless arcade goes dark and its discovered machines sleep. Adult unlimited-play mode still works.
- Twelve fully playable games. Every machine has instructions, a round timer, touch input, and saved personal high scores. Directional games also have keyboard input and on-screen buttons; Typing Ninja uses the phone or computer keyboard.
- Discovery milestones remain based on completed tasks. Discoveries are permanent. Avatar-shop points remain separate from game high scores and Force.
- Star Scoop is a **10-second** sprint.
- Monster Match ends when all six pairs are found, or after a **120-second** limit. Completion earns `max(100, round(2500 - elapsedSeconds × 18 - extraGuesses × 35))`. Incomplete rounds earn zero. Faster and more accurate finishes score higher.
- The avatar/task saving fix is retained: ordered saves, a 15-second request timeout, and visible task-form errors.
- Interface icons use bundled **Lucide** artwork and include its license. Games and animal art are original. All game files are cached with the PWA shell; account changes and recorded rewards require a connection.
- Game engines stop when the user leaves a game or hides the app. Rendering is capped at 30 frames per second. The focus timer remains quiet, with screen-awake requests limited to active timed tasks.

## Machines and unlocks

| Requested idea | Machine | Completed tasks | Round limit |
|---|---|---:|---:|
| Existing tapping game | Star Scoop | 0 | 10s |
| Existing matching game | Monster Match | 3 | 120s |
| Paintball skeet shooter | Nitrogen | 5 | 45s |
| Pong | Power Pong | 7 | 60s |
| Galaga-style shooter | Galaxy Patrol | 10 | 60s |
| Typing game | Typing Ninja | 13 | 60s |
| Frogger-style crossing | Frog Crossing | 16 | 60s |
| Dig Dug-style digging | Tunnel Tamer | 20 | 60s |
| Tetris-style falling blocks | Force Blocks | 24 | 90s |
| Maze | Neon Maze | 28 | 90s |
| Skee-ball | Gold Roll | 33 | 60s / nine rolls |
| Fish jumping from a bowl | Bowl Bounce | 38 | 45s |

Change names, milestones, descriptions and round limits in `public/config.js`. The server imports this same catalog, so its unlock rules stay synchronized.

Classic-inspired games use original names and graphics. Monster Match retains its original ID (`memory`) and Star Scoop retains `stars`, preserving existing best scores. Older Monster Match scores remain on the profile and are only replaced when a new score beats them.

## Validation

22 automated tests cover existing accounts, PINs, profile separation, avatar purchases, task rewards, power accounting, client/server game catalogs, speed scoring and the new mechanics. Browser checks cover registration, both arcade power states, avatar → task creation, all twelve game launches, mobile controls, score saving and layout at mobile and desktop widths. The 10-second tapping round and completed matching score are also checked end to end.

These are short arcade minigames, with increasing challenge and personal bests; physical-device speech, wake-lock support and the final reward balance still benefit from trying the app with the class.
