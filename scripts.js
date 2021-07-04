const types = {
    MOVIE: "movie",
    ACTOR: "actor",
    DIRECTOR: "director"
}
window.initiated = false;


function initiateCy() {
    window.cy = cytoscape({
        container: document.getElementById('cy'),
        style: [
            {
                selector: `node[type="${types.ACTOR}"]`,
                style: {
                    shape: 'hexagon',
                    'background-color': 'red',
                    label: 'data(id)'
                }
            },
            {
                selector: `node[type="${types.MOVIE}"]`,
                style: {
                    shape: 'square',
                    'background-color': 'blue',
                    label: 'data(id)'
                }
            }, {
                selector: `node[type="${types.DIRECTOR}"]`,
                style: {
                    shape: 'ellipse',
                    'background-color': 'green',
                    label: 'data(id)'
                }
            }]


    });


    let contextMenuOptions = {
        // Customize event to bring up the context menu
        // Possible options https://js.cytoscape.org/#events/user-input-device-events
        evtType: 'cxttap',
        // List of initial menu items
        // A menu item must have either onClickFunction or submenu or both
        menuItems: [
            {
                id: 'add-actor',
                content: 'add actors',
                tooltipText: 'add node',
                image: {src: "add.svg", width: 12, height: 12, x: 6, y: 4},
                selector: `node[type="${types.MOVIE}"]`,
                coreAsWell: true,
                onClickFunction: async function (event) {
                    let id = event.target._private.data.id;
                    console.log(id);
                    await addActorToNode(id);
                    setLayout(false)

                }
            }, {
                id: 'add-movie',
                content: 'add movies',
                tooltipText: 'add node',
                image: {src: "add.;sxsvg", width: 12, height: 12, x: 6, y: 4},
                selector: `node[type="${types.ACTOR}"]`,
                coreAsWell: true,
                onClickFunction: async function (event) {
                    let id = event.target._private.data.id;
                    console.log(id);
                    await addActorMoviesToNode(id);
                    setLayout(false)
                }
            }, {
                id: 'add-movie',
                content: 'add movies',
                tooltipText: 'add node',
                image: {src: "add.svg", width: 12, height: 12, x: 6, y: 4},
                selector: `node[type="${types.DIRECTOR}"]`,
                coreAsWell: true,
                onClickFunction: async function (event) {
                    let id = event.target._private.data.id;
                    console.log(id);
                    await addDirectorMoviesToNode(id);
                    setLayout(false)
                }
            }, {
                id: 'add-director',
                content: 'add director',
                tooltipText: 'add node',
                image: {src: "add.svg", width: 12, height: 12, x: 6, y: 4},
                selector: `node[type="${types.MOVIE}"]`,
                coreAsWell: true,
                onClickFunction: async function (event) {
                    let id = event.target._private.data.id;
                    console.log(id);
                    await addDirectorToNode(id)
                    setLayout(false)


                }
            },
        ],
        // css classes that menu items will have
        menuItemClasses: [
            // add class names to this list
        ],
        // css classes that context menu will have
        contextMenuClasses: [
            // add class names to this list
        ],
        // Indicates that the menu item has a submenu. If not provided default one will be used
        submenuIndicator: {src: 'assets/submenu-indicator-default.svg', width: 12, height: 12}


    };

    let viewUtilitiesOptions = {
        highlightStyles: [
            {
                node: {'border-color': '#0b9bcd', 'border-width': 3},
                edge: {
                    'line-color': '#0b9bcd',
                    'source-arrow-color': '#0b9bcd',
                    'target-arrow-color': '#0b9bcd',
                    'width': 3
                }
            },
            {
                node: {'border-color': '#04f06a', 'border-width': 3},
                edge: {
                    'line-color': '#04f06a',
                    'source-arrow-color': '#04f06a',
                    'target-arrow-color': '#04f06a',
                    'width': 3
                }
            },
        ],
        selectStyles: {
            node: {'border-color': 'black', 'border-width': 3, 'background-color': 'lightgrey'},
            edge: {'line-color': 'black', 'source-arrow-color': 'black', 'target-arrow-color': 'black', 'width': 3}
        },
        setVisibilityOnHide: false, // whether to set visibility on hide/show
        setDisplayOnHide: true, // whether to set display on hide/show
        zoomAnimationDuration: 1500, // default duration for zoom animation speed
        neighbor: function (ele) {
            return ele.closedNeighborhood();
        },
        neighborSelectTime: 500,
        lassoStyle: {lineColor: "#d67614", lineWidth: 3},// default lasso line color, dark orange, and default line width
        htmlElem4marqueeZoom: '', // should be string like `#cy` or `.cy`. `#cy` means get element with the ID 'cy'. `.cy` means the element with class 'cy'
        marqueeZoomCursor: 'se-resize', // the cursor that should be used when marquee zoom is enabled. It can also be an image if a URL to an image is given
        isShowEdgesBetweenVisibleNodes: true // When showing elements, show edges if both source and target nodes become visible
    };

    let api = window.cy.viewUtilities(viewUtilitiesOptions);

    window.cy.contextMenus(contextMenuOptions);

    window.cy.on('add', 'node', function (evt) {
        if (window.initiated) {
            var node = evt.target;
            api.highlight(node);
        }

        window.setTimeout(function () {
            api.removeHighlights()
        }, 2000);

    });

}


function addNode(id, type) {
    if (window.cy.getElementById(id).length === 0) {
        window.cy.add({
            data: {
                id: id,
                type: type
            }
        });
    } else {
    }

}

function joinNodes(id, src, dest) {
    if (window.cy.getElementById(id).length === 0) {
        window.cy.add({
            data: {
                id: id,
                source: src,
                target: dest
            }
        });
    } else {
    }

}


function initiateNeo4jDriver() {
    let driver = neo4j.driver(
        'neo4j://localhost:7687',
        neo4j.auth.basic('neo4j', '123456aA')
    );

    window.session = driver.session();


}

function clearGraph() {
    window.cy.element.remove();
}


async function findActorMovies(actorName) {
    let movies = [];
    initiateNeo4jDriver();

    await window.session
        .run('MATCH (person:Person {name: $nameParam})-[:ACTED_IN]->(movies) RETURN movies Limit 5', {
            nameParam: actorName
        })
        .then(result => {
            movies = result.records.map(record => record.get("movies").properties.title);
            console.log(movies)
        })
        .catch(error => {
            console.log(error)
        })

    return movies;
}

async function findDirectorMovies(directorName) {
    let movies = [];
    initiateNeo4jDriver();

    await window.session
        .run('MATCH (person:Person {name: $nameParam})-[:DIRECTED]->(movies) RETURN movies Limit 5', {
            nameParam: directorName
        })
        .then(result => {
            movies = result.records.map(record => record.get("movies").properties.title);
            console.log(movies)
        })
        .catch(error => {
            console.log(error)
        })

    return movies;
}

async function findActors(movieTitle) {
    initiateNeo4jDriver();
    let actors = [];

    await window.session
        .run('MATCH (movie {title: $movieTitle})<-[:ACTED_IN]-(actors) RETURN actors Limit 5', {
            movieTitle: movieTitle
        })
        .then(result => {
            actors = result.records.map(record => record.get("actors").properties.name);
        })
        .catch(error => {
            console.log(error)
        })
    return actors;
}

async function findDirectors(movie) {
    initiateNeo4jDriver();
    let directors = [];
    // MATCH p=()-[r:DIRECTED]->() RETURN p LIMIT 5
    await window.session
        .run('MATCH (movie {title: $movieTitle})<-[:DIRECTED]-(directors) RETURN directors Limit 5', {
            movieTitle: movie
        })
        .then(result => {
            console.log(result);

            directors = result.records.map(record => record.get("directors").properties.name);
        })
        .catch(error => {
            console.log(error)
        })
    return directors;
}


async function start() {

    // init
    initiateCy();
    initiateNeo4jDriver();

    let type = types.ACTOR;
    let name = ""
    let turns = 0;

    let movieRadio = document.getElementById("movie-radio");
    if (movieRadio.checked) {
        type = types.MOVIE
    }
    name = document.getElementById("name-input").value;
    if (name == "") {
        alert("No input name has been entered.")
        document.getElementById("load_screen").style.display = "none";
        return;
    }


    turns = document.getElementById('turn-input').value;
    turns = turns * 2;

    if (turns == "") {
        alert("No Trun has been entered.")
        document.getElementById("load_screen").style.display = "none";
        return;
    }
    console.log(name)
    console.log(turns)
    console.log(type)


    await drawNeighbours(name, type, turns);
    window.initiated = true;

}


async function drawNeighbours(centerId, type, turns) {
    let neighbours = []

    console.log("type in draw neighbours: " + type)


    if (type == types.ACTOR) {
        neighbours = await findActorMovies(centerId);
    } else {
        neighbours = await findActors(centerId);
    }

    draw(centerId, neighbours, type);


    await Promise.all(neighbours.map(async neighbour => {
        if (turns > 1) {
            if (type === types.ACTOR) {
                type = types.MOVIE;
            } else if (type === types.MOVIE) {
                type = types.ACTOR;
            }
            await drawNeighbours(neighbour, type, turns - 1)
        }
    }));

    setLayout(true);

}

async function addActorMoviesToNode(centerId) {
    let neighbours = await findActorMovies(centerId);
    console.log("nei movie: " + neighbours)

    draw(centerId, neighbours, types.ACTOR);
    joinNodes(centerId + neighbours[0], centerId, neighbours[0]);
}

async function addDirectorMoviesToNode(centerId) {
    let neighbours = await findDirectorMovies(centerId);
    console.log("nei movie: " + neighbours)

    draw(centerId, neighbours, types.MOVIE);
    joinNodes(centerId + neighbours[0], centerId, neighbours[0]);
}

async function addActorToNode(centerId) {
    let neighbours = await findActors(centerId);
    console.log("nei actor: " + neighbours)

    draw(centerId, neighbours, types.MOVIE);
    joinNodes(centerId + neighbours[0], centerId, neighbours[0]);
}

async function addDirectorToNode(centerId) {
    let neighbours = await findDirectors(centerId);
    console.log("nei director: " + neighbours)
    draw(neighbours[0], [], types.DIRECTOR)
    joinNodes(centerId + neighbours[0], centerId, neighbours[0]);
}


function draw(centerId, neighbours, type) {
    addNode(centerId, type);

    let newType;

    console.log("type in draw: " + type)

    if (type == types.ACTOR) {
        newType = types.MOVIE;
    } else if (type == types.MOVIE) {
        newType = types.ACTOR;
    } else {
        console.log("not any: " + newType + type)
    }

    neighbours.forEach(async neighbour => {
        addNode(neighbour, newType)
        joinNodes(neighbour + centerId, centerId, neighbour)
    });
}

function setLayout(randomize) {
    window.cy.layout({
        name: 'cose-bilkent',
        animate: 'end',
        animationEasing: 'ease-out',
        animationDuration: 2000,
        randomize: randomize,
        fit: true
    }).run();
}