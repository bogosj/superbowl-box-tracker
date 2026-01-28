# Superbowl Box Tracker PWA 🏈

A modern, mobile-friendly Progressive Web App (PWA) to track your Superbowl squares and pools.

**Live App:** [https://boxes.bogosian.dev](https://boxes.bogosian.dev)

![App Screenshot](./public/pwa-512x512.png)

## Features

- **🏆 2026 Superbowl LX Ready**: Pre-configured for **Seattle Seahawks** vs **New England Patriots**.
- **📱 PWA & Offline First**: Installable on iOS/Android and works without an internet connection.
- **🔢 Smart Winning Logic**: Automatically highlights your winning numbers based on the current score (Score % 10).
- **📝 Multiple Pools**: Track as many different pools as you need, each with multiple number pairs.
- **🔗 Shareable Links**: Generate a unique URL containing all your pools and teams to share with friends.
- **🎨 Premium Design**: Glassmorphism UI with team-specific theming.

## How to Use

1.  **Add a Pool**: Tap the **+ Add Pool** button.
2.  **Enter Numbers**: Input your row/column numbers for the Seahawks and Patriots. Add notes for winnings (e.g., "$50 Q1").
3.  **Track Score**: As the game progresses, update the score at the top.
4.  **Win!**: If your numbers match the last digit of the score, your pool card will light up green!
5.  **Share**: Use the **Share** button to copy a link that sends your exact board setup to a friend.

## Tech Stack

- **Framework**: React + Vite
- **Styling**: Vanilla CSS (Glassmorphism)
- **State**: LocalStorage + URL Parameters (`lz-string` compression)
- **Deployment**: GitHub Pages (via GitHub Actions)

## License

MIT
