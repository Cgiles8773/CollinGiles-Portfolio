import { Link } from 'react-router-dom'
import './ProjectCard.css'

export default function ProjectCard({ slug, title, description, image, tech, skills, liveUrl, repoUrl }) {
  const isExternal = Boolean(liveUrl)
  const primaryLinkProps = isExternal
    ? { href: liveUrl, target: '_blank', rel: 'noopener noreferrer' }
    : { to: `/projects/${slug}` }
  const PrimaryLink = isExternal ? 'a' : Link

  const link = <PrimaryLink {...primaryLinkProps} className="card-link">View Project →</PrimaryLink>

  return (
    <div className="project-card">
      <PrimaryLink {...primaryLinkProps} className="card-image">
        {image
          ? <img src={image} alt={title} />
          : <span className="card-image-placeholder" />
        }
      </PrimaryLink>
      <div className="card-body">
        <PrimaryLink {...primaryLinkProps} className="card-title-link">
          <h2 className="card-title">{title}</h2>
        </PrimaryLink>
        <p className="card-description">{description}</p>
        {skills?.length > 0 && (
          <ul className="card-tags">
            {skills.map((item) => (
              <li key={item} className="card-tag card-tag--skill">{item}</li>
            ))}
          </ul>
        )}
        {tech?.length > 0 && (
          <ul className="card-tags">
            {tech.map((item) => (
              <li key={item} className="card-tag">{item}</li>
            ))}
          </ul>
        )}
        {link}
        {repoUrl && (
          <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="card-link card-link--repo">View Code →</a>
        )}
      </div>
    </div>
  )
}
