import { Link } from 'react-router-dom'
import './ProjectCard.css'

export default function ProjectCard({ slug, title, description, image, tech, liveUrl }) {
  const link = liveUrl
    ? <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="card-link">View Project →</a>
    : <Link to={`/projects/${slug}`} className="card-link">View Project →</Link>

  return (
    <div className="project-card">
      <div className="card-image">
        {image
          ? <img src={image} alt={title} />
          : <span className="card-image-placeholder" />
        }
      </div>
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <p className="card-description">{description}</p>
        {tech?.length > 0 && (
          <ul className="card-tags">
            {tech.map((item) => (
              <li key={item} className="card-tag">{item}</li>
            ))}
          </ul>
        )}
        {link}
      </div>
    </div>
  )
}
