// // Cookie Playground
// // 1. Setting Up a cookie
// app.use('/set-user', (
//     req: Request,
//     res: Response,
// ) => {
//     res.cookie('username', 'johnDoe', {
//         maxAge: 900000, // Express in 15 Min
//         httpOnly: true // For security
//     })
//     res.send('User Cookie has been set!')
// })

// // 2. Reading a Cookie 
// app.use('/get-user', (
//     req: Request,
//     res: Response,
// ) => {
//     let user = req.cookies.username // Accessing the parsed Cookie.
//     res.send(`Welcome back, ${user || "Guest"}`)
// })

// // 3. Clearing a Cookie
// app.use('/clear-user', (
//     req: Request,
//     res: Response
// ) => {
//     res.clearCookie('username');
//     res.send('Cookie cleared!');
// })