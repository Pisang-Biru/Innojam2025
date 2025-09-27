import { createFileRoute } from '@tanstack/react-router'
import logo from '../logo.svg'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="">
      <section id="home" className="h-screen bg-orange-100">Home</section>
      <section id="about" className="h-screen">About</section>
      <section id="rooms" className="h-screen bg-orange-100">Rooms</section>
      <section id="facilities" className="h-screen">Facilities</section>
      <section id="contact" className="h-screen bg-orange-100">Contact</section>
    </div>
  )
}
