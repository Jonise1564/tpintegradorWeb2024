document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('filterForm');
    const gallery = document.getElementById('gallery');
    const pagination = document.getElementById('pagination');
    const loader = document.getElementById('loader'); // Indicador de cargando..
    let currentPage = 1;
    const resultsPerPage = 20;
    const maxPages = 10; // Limitar a 10 páginas

    // Resetear el formulario al recargar la página
   // form.reset();

    // Cargar opciones de departamentos
    fetch('https://collectionapi.metmuseum.org/public/collection/v1/departments')
        .then(response => response.json())
        .then(data => {
            const departmentSelect = document.getElementById('department');
            data.departments.forEach(department => {
                const option = document.createElement('option');
                option.value = department.departmentId;
                option.textContent = departmentTranslations[department.displayName] || department.displayName;
                departmentSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching departments:', error);
            const departmentSelect = document.getElementById('department');
            departmentSelect.innerHTML = '<option>Error al cargar departamentos</option>';
        });

    // Objeto de traducción departamentos
    const departmentTranslations = {
        "American Decorative Arts": "Artes Decorativas Americanas",
        "Ancient Near Eastern Art": "Arte del Cercano Oriente Antiguo",
        "Arms and Armor": "Armas y Armaduras",
        "Arts of Africa, Oceania, and the Americas": "Artes de África, Oceanía y las Américas",
        "Asian Art": "Arte Asiático",
        "The Costume Institute": "El Instituto del Vestido",
        "Drawings and Prints": "Dibujos y Grabados",
        "Egyptian Art": "Arte Egipcio",
        "European Paintings": "Pinturas Europeas",
        "European Sculpture and Decorative Arts": "Escultura y Artes Decorativas Europeas",
        "Greek and Roman Art": "Arte Griego y Romano",
        "Islamic Art": "Arte Islámico",
        "The Robert Lehman Collection": "La Colección Robert Lehman",
        "The Libraries": "Las Bibliotecas",
        "Medieval Art": "Arte Medieval",
        "Musical Instruments": "Instrumentos Musicales",
        "Photographs": "Fotografías",
        "Modern Art": "Arte Moderno"
    };

    // Recuperar parámetros de búsqueda y página actual de localStorage
    const savedDepartment = localStorage.getItem('department');
    const savedKeyword = localStorage.getItem('keyword');
    const savedLocation = localStorage.getItem('location');
    const savedPage = localStorage.getItem('currentPage');

    if (savedDepartment) document.getElementById('department').value = savedDepartment;
    if (savedKeyword) document.getElementById('keyword').value = savedKeyword;
    if (savedLocation) document.getElementById('location').value = savedLocation;
    if (savedPage) currentPage = parseInt(savedPage, 10);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Validar que los campos no estén vacíos
        const department = document.getElementById('department').value;
        const keyword = document.getElementById('keyword').value;
        const location = document.getElementById('location').value;

        if (!department && !keyword && !location) {
            alert('Por favor, complete algún parámetro de la búsqueda.');
            const campo = document.getElementById('keyword');
            campo.focus();
            return;
        }

        currentPage = 1; // Restablecer a la primera página en una nueva búsqueda
        localStorage.setItem('currentPage', currentPage); // Guardar la página actual en localStorage
        await fetchResults();
    });

    async function fetchResults() {
        gallery.innerHTML = '';
        pagination.innerHTML = ''; // Limpiar paginación antes de agregar nuevos botones
        loader.style.display = 'block'; // Mostrar indicador de carga
        const processedTitles = new Set(); // Restablecer el conjunto de títulos procesados

        const department = document.getElementById('department').value;
        const keyword = document.getElementById('keyword').value;
        const location = document.getElementById('location').value;

        // Guardar parámetros de búsqueda en localStorage
        localStorage.setItem('department', department);
        localStorage.setItem('keyword', keyword);
        localStorage.setItem('location', location);

        let url = 'https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true';
        url += keyword ? `&q=${keyword}` : '&q=""';
        if (department) url += `&departmentId=${department}`;
        if (location) url += `&geoLocation=${location}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.objectIDs) {
                const totalResults = data.objectIDs.length;
                const totalPages = Math.min(Math.ceil(totalResults / resultsPerPage), maxPages);
                const start = (currentPage - 1) * resultsPerPage;
                const end = start + resultsPerPage;
                const objectIDs = data.objectIDs.slice(start, end);

                for (const id of objectIDs) {
                    try {
                        const objectResponse = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
                        const objectData = await objectResponse.json();

                        if (objectData.primaryImageSmall && !processedTitles.has(objectData.title)) {
                            const title = objectData.title;
                            const culture = objectData.culture || 'N/A';
                            const dynasty = objectData.dynasty || 'N/A';

                            processedTitles.add(title);

                            const card = document.createElement('div');
                            card.classList.add('card', 'col-md-3');

                            const img = document.createElement('img');
                            img.src = objectData.primaryImageSmall;
                            img.alt = title;
                            img.classList.add('card-img-top');
                            img.title = `Fecha de creación: ${objectData.objectDate || 'Desconocida'}`;

                            const cardBody = document.createElement('div');
                            cardBody.classList.add('card-body');

                            const cardTitle = document.createElement('h5');
                            cardTitle.classList.add('card-title');
                            cardTitle.textContent = title;

                            const cardText = document.createElement('p');
                            cardText.classList.add('card-text');
                            cardText.innerHTML = `
                                <strong>Cultura:</strong> ${culture}<br>
                                <strong>Dinastía:</strong> ${dynasty}
                            `;

                            cardBody.appendChild(cardTitle);
                            cardBody.appendChild(cardText);

                            if (objectData.additionalImages && objectData.additionalImages.length > 0) {
                                const viewMoreButton = document.createElement('button');
                                viewMoreButton.classList.add('btn', 'btn-secondary');
                                viewMoreButton.textContent = 'Ver Imágenes Adicionales';
                                viewMoreButton.onclick = () => {
                                    window.open(`additional-images.html?objectID=${objectData.objectID}`, '_blank');
                                    //  window.location.href = `additional-images.html?objectID=${objectData.objectID}`;
                                    // if (savedDepartment || savedKeyword || savedLocation) {
                                    //     fetchResults();
                                    //  }

                                };
                                cardBody.appendChild(viewMoreButton);
                            }
                            card.appendChild(img);
                            card.appendChild(cardBody);
                            gallery.appendChild(card);
                        }
                    } catch (error) {
                        console.error(`Error fetching object data for ID ${id}:`, error);
                    }
                }

                if (totalResults > resultsPerPage) {
                    for (let i = 1; i <= totalPages; i++) {
                        const button = document.createElement('button');
                        button.textContent = i;
                        button.classList.add('pagination-button', 'btn', 'm-1');
                        if (i === currentPage) {
                            button.classList.add('active');
                        }
                        button.addEventListener('click', async () => {
                            currentPage = i;
                            localStorage.setItem('currentPage', currentPage);
                            await fetchResults();
                        });
                        pagination.appendChild(button);
                    }
                }
            } else {
                gallery.innerHTML = '<p>No se encontraron resultados.</p>';
            }
        } catch (error) {
            console.error('Error fetching search results:', error);
            gallery.innerHTML = '<p>Hubo un error al recuperar los resultados. Por favor, inténtelo de nuevo más tarde.</p>';
        } finally {
            loader.style.display = 'none';
        }
    }

    // Fetch initial results if there are saved parameters
    if (savedDepartment || savedKeyword || savedLocation) {
       //fetchResults();
    }
});
