import { useState } from 'react'
import BookCard from '../components/BookCard'
import books from '../data/books'
import './Reading.css'

const allTags = ['All', ...new Set(books.flatMap(b => b.tags ?? []))]

export default function Reading() {
  const [activeTag, setActiveTag] = useState('All')

  const filtered = activeTag === 'All'
    ? books
    : books.filter(b => b.tags?.includes(activeTag))

  return (
    <main className="reading-page">
      <div className="reading-header">
        <h1 className="reading-heading">Reading</h1>
        <select
          className="reading-filter"
          value={activeTag}
          onChange={e => setActiveTag(e.target.value)}
        >
          {allTags.map(tag => <option key={tag}>{tag}</option>)}
        </select>
      </div>
      <div className="reading-grid">
        {filtered.map(book => (
          <BookCard key={book.title} {...book} activeTag={activeTag} onTagClick={setActiveTag} />
        ))}
      </div>
    </main>
  )
}
