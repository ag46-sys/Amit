// contributions.js
document.addEventListener('DOMContentLoaded', function() {
    const publicationsList = document.getElementById('publications-list');
    const noResults = document.querySelector('.no-results');
    const searchInput = document.getElementById('search-input');
    const typeFilters = document.querySelectorAll('.filter-btn[data-type]');
    const yearFilter = document.getElementById('year-filter');
    const sortFilter = document.getElementById('sort-filter');
    
    let allPublications = [];
    
    // Fetch and parse CSV data
    fetch('articles.csv')
        .then(response => response.text())
        .then(csvData => {
            allPublications = parseCSV(csvData);
            renderPublications(allPublications);
            setupEventListeners();
        })
        .catch(error => {
            console.error('Error loading publications:', error);
            publicationsList.innerHTML = `
                <div class="error-message">
                    <p>Failed to load publications. Please try again later.</p>
                </div>
            `;
        });
    
    function parseCSV(csv) {
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(header => header.trim());
        
        return lines.slice(1)
            .filter(line => line.trim() !== '')
            .map(line => {
                const values = line.split(',').map(value => value.trim());
                const publication = {};
                
                headers.forEach((header, index) => {
                    publication[header] = values[index] || '';
                });
                
                return publication;
            });
    }
    
    function renderPublications(publications) {
        if (publications.length === 0) {
            publicationsList.style.display = 'none';
            noResults.style.display = 'block';
            return;
        }
        
        publicationsList.style.display = 'grid';
        noResults.style.display = 'none';
        
        publicationsList.innerHTML = publications.map(pub => `
            <div class="publication-card" data-type="${pub.Type.toLowerCase()}">
                <div class="pub-type">${formatType(pub.Type)}</div>
                <h3 class="pub-title">${pub.Title}</h3>
                <p class="pub-authors">${pub.Authors}</p>
                <p class="pub-details">
                    ${pub.Publisher ? `${pub.Publisher}, ` : ''}
                    ${pub.Year}
                    ${pub.Volume ? `, Vol. ${pub.Volume}` : ''}
                    ${pub.Pages ? `, pp. ${pub.Pages}` : ''}
                </p>
                <div class="pub-links">
                    ${pub.DOI ? `<a href="https://doi.org/${pub.DOI}" target="_blank"><i class="fas fa-external-link-alt"></i> View Publication</a>` : ''}
                    ${pub.URL ? `<a href="${pub.URL}" target="_blank"><i class="fas fa-link"></i> Website</a>` : ''}
                    ${pub.PDF ? `<a href="${pub.PDF}" target="_blank"><i class="fas fa-file-pdf"></i> PDF</a>` : ''}
                </div>
            </div>
        `).join('');
    }
    
    function formatType(type) {
        const typeMap = {
            'journal': 'Journal Article',
            'conference': 'Conference Paper',
            'book': 'Book Chapter',
            'thesis': 'Thesis',
            'preprint': 'Preprint'
        };
        
        return typeMap[type.toLowerCase()] || type;
    }
    
    function filterPublications() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedType = document.querySelector('.filter-btn[data-type].active').dataset.type;
        const selectedYear = yearFilter.value;
        
        let filtered = allPublications.filter(pub => {
            // Search term filter
            const matchesSearch = 
                pub.Title.toLowerCase().includes(searchTerm) || 
                pub.Authors.toLowerCase().includes(searchTerm) ||
                pub.Publisher.toLowerCase().includes(searchTerm);
            
            // Type filter
            const matchesType = selectedType === 'all' || pub.Type.toLowerCase() === selectedType;
            
            // Year filter
            const matchesYear = selectedYear === 'all' || pub.Year === selectedYear;
            
            return matchesSearch && matchesType && matchesYear;
        });
        
        // Sort publications
        const sortOption = sortFilter.value;
        
        filtered.sort((a, b) => {
            if (sortOption === 'year-desc') {
                return parseInt(b.Year) - parseInt(a.Year);
            } else if (sortOption === 'year-asc') {
                return parseInt(a.Year) - parseInt(b.Year);
            } else if (sortOption === 'title') {
                return a.Title.localeCompare(b.Title);
            }
            return 0;
        });
        
        renderPublications(filtered);
    }
    
    function setupEventListeners() {
        // Search input
        searchInput.addEventListener('input', filterPublications);
        
        // Type filters
        typeFilters.forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelector('.filter-btn[data-type].active').classList.remove('active');
                btn.classList.add('active');
                filterPublications();
            });
        });
        
        // Year filter
        yearFilter.addEventListener('change', filterPublications);
        
        // Sort filter
        sortFilter.addEventListener('change', filterPublications);
    }
});

