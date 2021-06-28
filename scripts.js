function initiateCy() {
    window.cy = cytoscape({
        container: document.getElementById('cy'),
        style: [
            {
                selector: 'node[type="actor"]',
                style: {
                    shape: 'hexagon',
                    'background-color': 'red',
                    label: 'data(id)'
                }
            },
            {
                selector: 'node[type="movie"]',
                style: {
                    shape: 'square',
                    'background-color': 'blue',
                    label: 'data(id)'
                }
            }]


    });
   

    var options = {
        // Customize event to bring up the context menu
        // Possible options https://js.cytoscape.org/#events/user-input-device-events
        evtType: 'cxttap',
        // List of initial menu items
        // A menu item must have either onClickFunction or submenu or both
        menuItems: [
            /*{
                id: 'remove', // ID of menu item
                content: 'remove', // Display content of menu item
                tooltipText: 'remove', // Tooltip text for menu item
                image: {src: "remove.svg", width: 12, height: 12, x: 6, y: 4}, // menu icon
                // Filters the elements to have this menu item on cxttap
                // If the selector is not truthy no elements will have this menu item on cxttap
                selector: 'node, edge',
                onClickFunction: function () { // The function to be executed on click
                    console.log('remove element');
                },
                disabled: false, // Whether the item will be created as disabled
                show: false, // Whether the item will be shown or not
                hasTrailingDivider: true, // Whether the item will have a trailing divider
                coreAsWell: false ,// Whether core instance have this item on cxttap
                submenu: [] // Shows the listed menuItems as a submenu for this item. An item must have either submenu or onClickFunction or both.
            },
            {
                id: 'hide',
                content: 'hide',
                tooltipText: 'hide',
                selector: 'node, edge',
                onClickFunction: function () {
                    console.log('hide element');
                },
                disabled: true
            },*/
            {
                id: 'add-node',
                content: 'add actors',
                tooltipText: 'add node',
                image: {src: "add.svg", width: 12, height: 12, x: 6, y: 4},
                selector: 'node[type="movie"]',
                coreAsWell: true,
                onClickFunction: function (event) {
                    let id = event.target._private.data.id;
                    console.log(id);
                    drawNeighbours(id, false, 1)

                }
            }, {
                id: 'add-node',
                content: 'add movies',
                tooltipText: 'add node',
                image: {src: "add.svg", width: 12, height: 12, x: 6, y: 4},
                selector: 'node[type="actor"]',
                coreAsWell: true,
                onClickFunction: function (event) {
                    let id = event.target._private.data.id;
                    console.log(id);
                    drawNeighbours(id, true, 1)

                }
            }
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

    window.cy.contextMenus(options);


}


function addNode(id, isActor) {
    if (window.cy.getElementById(id).length === 0) {
        window.cy.add({
            data: {
                id: id,
                type: isActor ? "actor" : "movie"
            }
        });
        cy.layout({
            name: 'cose-bilkent',
            animate: 'end',
            animationEasing: 'ease-out',
            animationDuration: 2000,
            randomize: true,
            fit: true
        }).run();
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
        cy.layout({
            name: 'cose-bilkent',
            animate: 'end',
            animationEasing: 'ease-out',
            animationDuration: 2000,
            randomize: true,
            fit: true
        }).run();
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


async function findMovies(actorName) {
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


async function start() {

    // init
    initiateCy();
    initiateNeo4jDriver();

    let isActor = true;
    let name = ""
    let turns = 0;

    let movieRadio = document.getElementById("movie-radio");
    if (movieRadio.checked) {
        isActor = false;
    }
    name = document.getElementById("name-input").value;
    if (name == "") {
        alert("No input name has been entered.")
        document.getElementById("load_screen").style.display = "none";
        return;
    }


    turns = document.getElementById('turn-input').value;
    if (turns == "") {
        alert("No Trun has been entered.")
        document.getElementById("load_screen").style.display = "none";
        return;
    }
    console.log(name)
    console.log(turns)

    await drawNeighbours(name, isActor, turns);
    // window.session.close();

}

async function drawNeighbours(centerId, isActor, turns) {
    addNode(centerId, isActor)
    let neighbours = []
    if (isActor) {
        neighbours = await findMovies(centerId);
    } else {
        neighbours = await findActors(centerId);
    }
    neighbours.forEach(async neighbour => {
        addNode(neighbour, !isActor)
        joinNodes(neighbour + centerId, centerId, neighbour)
        if (turns > 1) {
            await drawNeighbours(neighbour, !isActor, turns - 1)
        }
    })
}
