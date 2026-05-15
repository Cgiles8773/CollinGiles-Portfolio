import ProjectCard from '../components/ProjectCard'
import projects from '../data/projects'
import './Projects.css'

export default function Projects() {
  return (
    <main className="projects-page">
      <h1 className="projects-heading">Projects</h1>
      <div className="projects-grid">
        {projects.map(project => (
          <ProjectCard key={project.slug} {...project} />
        ))}
      </div>
    </main>
  )
}
