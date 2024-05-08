declare namespace Express {
export interface Request {
tenant?: string
}
}
This will allow you to, at any point in your code, use something like this:

router.use((req, res, next) => {
req.tenant = 'tenant-X'
next()
})

router.get('/whichTenant', (req, res) => {
res.status(200).send('This is your tenant: '+req.tenant)
})
