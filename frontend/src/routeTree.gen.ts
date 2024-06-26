// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as SignUpImport } from './routes/sign-up'
import { Route as SettingsImport } from './routes/settings'
import { Route as NewPostImport } from './routes/new-post'
import { Route as UsernameImport } from './routes/$username'
import { Route as IndexImport } from './routes/index'
import { Route as SettingsUpdateProfileImport } from './routes/settings.update-profile'
import { Route as PostsIdImport } from './routes/posts.$id'

// Create/Update Routes

const SignUpRoute = SignUpImport.update({
  path: '/sign-up',
  getParentRoute: () => rootRoute,
} as any)

const SettingsRoute = SettingsImport.update({
  path: '/settings',
  getParentRoute: () => rootRoute,
} as any)

const NewPostRoute = NewPostImport.update({
  path: '/new-post',
  getParentRoute: () => rootRoute,
} as any)

const UsernameRoute = UsernameImport.update({
  path: '/$username',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const SettingsUpdateProfileRoute = SettingsUpdateProfileImport.update({
  path: '/update-profile',
  getParentRoute: () => SettingsRoute,
} as any)

const PostsIdRoute = PostsIdImport.update({
  path: '/posts/$id',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/$username': {
      preLoaderRoute: typeof UsernameImport
      parentRoute: typeof rootRoute
    }
    '/new-post': {
      preLoaderRoute: typeof NewPostImport
      parentRoute: typeof rootRoute
    }
    '/settings': {
      preLoaderRoute: typeof SettingsImport
      parentRoute: typeof rootRoute
    }
    '/sign-up': {
      preLoaderRoute: typeof SignUpImport
      parentRoute: typeof rootRoute
    }
    '/posts/$id': {
      preLoaderRoute: typeof PostsIdImport
      parentRoute: typeof rootRoute
    }
    '/settings/update-profile': {
      preLoaderRoute: typeof SettingsUpdateProfileImport
      parentRoute: typeof SettingsImport
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren([
  IndexRoute,
  UsernameRoute,
  NewPostRoute,
  SettingsRoute.addChildren([SettingsUpdateProfileRoute]),
  SignUpRoute,
  PostsIdRoute,
])
