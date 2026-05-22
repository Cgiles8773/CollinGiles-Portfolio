import './BookCard.css'

export default function BookCard({ title, author, cover, summary, review, tags, activeTag, onTagClick }) {
  return (
    <article className="book-card">
      <div className="book-top">
        <div className="book-cover">
          {cover
            ? <img src={cover} alt={`${title} cover`} />
            : <span className="book-cover-placeholder" />
          }
        </div>
        <div className="book-info">
          <h2 className="book-title">{title}</h2>
          <p className="book-author">{author}</p>
          <p className="book-summary">{summary}</p>
          {tags?.length > 0 && (
            <ul className="book-tags">
              {tags.map(tag => (
                <li key={tag}>
                  <button
                    className={`book-tag ${tag === activeTag ? 'book-tag--active' : ''}`}
                    onClick={() => onTagClick(tag === activeTag ? 'All' : tag)}
                  >
                    {tag}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="book-bottom">
        <span className="book-review-label">My Thoughts</span>
        <p className="book-review">{review}</p>
      </div>
    </article>
  )
}
