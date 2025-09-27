import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/read-item')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/read-item"!</div>
}
