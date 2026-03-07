export const RESERVED_SLUGS = [
    'www', 'app', 'api', 'pricing', 'signup', 'onboarding',
    'login', 'dashboard', 'support', 'mail', 'admin', 'help',
    'blog', 'status', 'docs', 'careers', 'about', 'contact'
]

export function isSlugValid(slug: string): boolean {
    return /^[a-z0-9-]{3,30}$/.test(slug) && !RESERVED_SLUGS.includes(slug.toLowerCase())
}
