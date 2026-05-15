import { useParams, Link } from 'react-router-dom'
import projects from '../data/projects'
import './ProjectDetail.css'

export default function ProjectDetail() {
  const { slug } = useParams()
  const project = projects.find(p => p.slug === slug)

  if (!project) {
    return (
      <div className="project-detail-page">
        <Link to="/projects" className="back-link">← Projects</Link>
        <p className="project-not-found">Project not found.</p>
      </div>
    )
  }

  return (
    <div className="project-detail-page">
      <div className="project-detail-header">
        <Link to="/projects" className="back-link">← Projects</Link>
        <h1 className="project-detail-title">{project.title}</h1>
        <p className="project-detail-desc">{project.description}</p>
        {project.tech && (
          <ul className="project-detail-tech">
            {project.tech.map(t => <li key={t}>{t}</li>)}
          </ul>
        )}
      </div>

      <div className="project-detail-embed">
        {project.liveUrl ? (
          <>
            <iframe
              src={project.liveUrl}
              title={project.title}
              className="project-iframe"
              allowFullScreen
            />
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="project-fullscreen-link"
            >
              Open full screen ↗
            </a>
          </>
        ) : (
          <div className="project-coming-soon">
            <p>Live demo coming soon.</p>
          </div>
        )}
      </div>
    </div>
  )
}
