# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]: Email
      - textbox "you@example.com" [ref=e5]
      - generic [ref=e6]: Password
      - textbox "••••••••" [ref=e7]
      - button "Sign In" [ref=e8]
      - button "Sign Up" [ref=e9]
      - generic [ref=e14]: Or
      - button "Continue as Guest" [active] [ref=e15]:
        - text: Continue as Guest
        - img [ref=e16]
    - link "← Back to home" [ref=e19] [cursor=pointer]:
      - /url: /
  - button "Open Next.js Dev Tools" [ref=e25] [cursor=pointer]:
    - img [ref=e26]
  - alert [ref=e29]
```