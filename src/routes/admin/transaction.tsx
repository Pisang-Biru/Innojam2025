import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/transaction')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/transaction"!</div>
}
