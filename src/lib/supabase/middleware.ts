import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isPublicRoute = request.nextUrl.pathname === '/' || 
                        request.nextUrl.pathname.startsWith('/login') || 
                        request.nextUrl.pathname.startsWith('/register') ||
                        request.nextUrl.pathname.startsWith('/api/')

  // Closed SaaS: Redirect register to home
  if (request.nextUrl.pathname.startsWith('/register')) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Role-based protection for dashboard routes
  if (user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const { data: clinicUser } = await supabase
      .from('clinic_users')
      .select('role')
      .eq('user_id', user.id)
      .single()
    
    const userRole = clinicUser?.role
    const path = request.nextUrl.pathname

    if (userRole === 'admin') {
      // Admin: Block Inbox and Agenda (Operational screens)
      if (path.startsWith('/dashboard/inbox') || path.startsWith('/dashboard/agenda')) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    } else {
      // Attendant: Block Config, Profissionais, and Management Dashboard
      const isManagementPath = path.startsWith('/dashboard/config') || 
                               path.startsWith('/dashboard/profissionais') ||
                               path === '/dashboard'
      
      if (isManagementPath) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard/inbox'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
