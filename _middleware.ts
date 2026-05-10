// (Keep your existing middleware imports and logic at the top)

export const config = {
  // This Regex tells NextAuth: "Protect everything EXCEPT the api folder and static files"
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};