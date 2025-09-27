import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/test2')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/api/test2"!</div>
}
