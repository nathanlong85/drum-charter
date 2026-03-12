# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]: Email
      - textbox "you@example.com" [ref=e5]
      - generic [ref=e6]: Password
      - textbox "••••••••" [ref=e7]
      - button "Sign In" [ref=e8]
      - button "Sign Up" [ref=e9]
      - generic [ref=e14]: Or
      - button "Continue as Guest" [ref=e15]:
        - text: Continue as Guest
        - img [ref=e16]
      - paragraph [ref=e18]: "Error: Request rate limit reached"
    - link "← Back to home" [ref=e20] [cursor=pointer]:
      - /url: /
  - button "Open Next.js Dev Tools" [ref=e26] [cursor=pointer]:
    - img [ref=e27]
  - alert [ref=e30]
```