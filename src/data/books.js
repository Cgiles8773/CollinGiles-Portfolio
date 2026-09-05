/*  
  {
    title: 'Example Book Title',
    author: 'Author Name',
    cover: null,
    summary: 'A brief description of what this book is about.',
    review: 'Your personal thoughts on the book go here.',
    tags: ['Fiction'],
  },
*/
const books = [
  {
    title: 'Dune',
    author: 'Frank Herbert',
    cover: 'https://covers.openlibrary.org/b/id/14838515-L.jpg',
    summary: 'Dune is a space opera following the Atreides, a family who rules over the desert planet Arrakis - the only planet able to produce "spice" melange. Lisan al gaib, imperialism, and a whole lot of sandworms.',
    review: 'A cornerstone of the scifi genre for a reason - that reason being timeless themes, unrivaled world-building, and the adventure of the Atreides themselves. Dune trades accessibility for depth, which may deter some readers, but I found it to be a very engaging and rewarding read. I originally started reading this series to prepare for the new movies, but still have yet to see them. While the latter books can be a bit of a struggle to get through, I think the first book has widespread appeal, while the second and third will satisfy scifi fans.',
    tags: ['Fiction', 'Science Fiction']
  },
  {
    title: 'Hyperion',
    author: 'Dan Simmons',
    cover: 'https://covers.openlibrary.org/b/id/15211746-M.jpg',
    summary: 'On the verge of intergalactic war, a group of pilgrims are sent to the planet Hyperion - home of the Time Tombs, structures that move backwards through time, and the Shrike, a mysterious living metal creature who calls the Time Tombs home. The reason for this pilgrimage is a mystery, but it may be the key to saving humanity from extinction.',
    review: 'Another high point in the scifi genre, Hyperion excels not only because of the politics and world building, but because of its characters. Dan Simmons tells the stories of the pilgrims in their distinctive voices and storytelling styles, and sets up a tantalizing mystery with the Shrike - Both things made this book impossible to put down. And then it ends! I can easily recommend this book to anybody - but the sequel is great too. Particularly if you are trying to get your buddy who only reads fantasy to dip their toes into scifi.',
    tags: ['Fiction', 'Science Fiction'],
  },
  {
    title: 'The Color of Magic',
    author: 'Terry Pratchett',
    cover: 'https://covers.openlibrary.org/b/isbn/9780060855925-M.jpg',
    summary: 'Rincewind is a magician - a very, very shoddy magician. This introductory book to the Discworld follows Rincewind as he stumbles his way through encounters with forgotten gods, imaginary friends, and more.',
    review: 'If you have yet to read Terry Pratchett, go ahead and fix that immediately. The Color of Magic may not be my favorite story in Discworld, but it\'s still chock full of Pratchett\'s wit. New readers may be a bit discombobulated, but the whimsy and wit were more than enough to keep my interest high.',
    tags: ['Fiction', 'Fantasy', 'Funny'],
  },
  {
    title: 'Veniss Underground',
    author: 'Alex Vandermeer',
    cover: 'https://ia601909.us.archive.org/view_archive.php?archive=/31/items/l_covers_0013/l_covers_0013_79.zip&file=0013794666-L.jpg',
    summary: 'In the city of Veniss, the wannabe bioengineering artist Nicholas goes missing, after making a shady underground deal. His twin sister, and her ex-lover descend below the surface of the city in search of him. ',
    review: 'Let me start by saying how much I love the world of the SCP foundation - a writing community that gave me a voracious appetite for surreal, dark stories. This book scratches that itch perfectly - Its a dive into a bizzare, malformed world that parodies the myth of Orpheus. Theres a standout chapter, that is so gross and visceral I had to pause midway through reading. I heartily recommend this to fans of Lovecraft, SCP, and all things freaky!',
    tags: ['Fiction', 'Science Fiction', 'Surreal'],
  },
  {
    title: 'Do Androids Dream of Electric Sheep?',
    author: 'Philip K. Dick',
    cover: 'https://covers.openlibrary.org/b/id/11153217-L.jpg',
    summary: 'In a post-apocalyptic future where WWIII has devastated Earth and driven most species to extinction, people prize real animals but often settle for lifelike robotic substitutes. Highly advanced androids, built for off-world colonists, are banned on Earth after growing too dangerous to distinguish from humans. Bounty hunter Rick Deckard is tasked with hunting down and "retiring" androids that have illegally returned to Earth—a job that turns deadly when they fight back.',
    review: 'The book that spawned the Blade Runner franchise. I was surprised by how bleak, and disorienting the story was. Deckard\'s job is to hunt androids, at the risk of them pretending to be humans, leaking into society, yet he himself feels barely human. Almost all of the characters feel flat and depressed, except for J.R. Isodore, who just wants to feel accepted. The way the androids treat him and trick him was heartbreaking. This story is fascinating, but I don\'t know which version I prefer more - the book or the movie.',
    tags: ['Fiction', 'Science Fiction', 'Surreal', 'Thriller'],
  },
  {
    title: 'The Da Vinci Code',
    author: 'Dan Brown',
    cover: 'https://covers.openlibrary.org/b/id/12392336-L.jpg',
    summary: 'Robert Langdon, a Harvard symbologist visiting Paris, is pulled into a murder investigation after the Louvre\'s curator is found dead alongside a cryptic cipher. As Langdon deciphers the code, he uncovers a hidden trail of clues embedded in Leonardo da Vinci\'s artwork—hiding in plain sight yet cleverly concealed.',
    review: 'Your dad would love this book! I did not! Dan Brown weaves a ton of interesting history into the main mystery of the book, which did reignite my interest in historical writing. However the characters are stock, the leaps in logic are notorious, and every single chapter ends on a twist/cliffhanger. All 107 of them. Further, story kneecaps itself by reducing the scale of the drama to just a few characters (What happened to the big scary secret societies?), and last but not least - the ending is laughable, and underwhelming. To be frank - I have read much worse stories than this one, but the good parts make the rest of it all the more frustrating.',
    tags: ['Fiction', 'Thriller'],
  },
  {
    title: 'Foundation',
    author: 'Isaac Asimov',
    cover: 'https://covers.openlibrary.org/b/id/12991847-L.jpg',
    summary: 'For twelve thousand years the Galactic Empire has ruled supreme. Now it is dying. Only Hari Seldon, creator of the revolutionary science of psychohistory, can see into the future--a dark age of ignorance, barbarism, and warfare that will last thirty thousand years. To preserve knowledge and save mankind, Seldon gathers the best minds in the Empire and brings them to a planet at the edge of the Galaxy to serve as a beacon of hope for future generations. He calls his sanctuary the Foundation. But soon the fledgling Foundation finds itself at the mercy of corrupt warlords rising in the wake of the receding Empire. And mankind\'s last best hope is faced with an agonizing choice: submit to the barbarians and live as slaves--or take a stand for freedom and risk total destruction.',
    review: 'This book is phenomonal. The story is split between different time periods in the Foundations history. Each time a new crisis threatens to destroy the Foundation, and without military might, the people of the Foundation must come up with a creative way to keep their society afloat. The story is so fun and engaging, that despite us as an audience knowing they have psychohistoric plot armor, it\'s still exciting to see how the Foundation overcomes its problems.',
    tags: ['Fiction', 'Science Fiction'],
  },
]

export default books

//