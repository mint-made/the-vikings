const game = {
    grid: [],
    items: [],
    players: [],
    weapons: ["hammer", "war-hammer", "axe", "sword", "spear", "bow-and-arrow"],
    allowedMovement: [],
    turnCount: 1,
    elements: {
        show(elementId, display = "block") {
            const showElement = document.getElementById(elementId);
            showElement.style.display = display;
        },
        hide(elementId) {
            const hideElement = document.getElementById(elementId);
            hideElement.style.display = "none";
        },
        addClass(elementId, className) {
            const element = document.getElementById(elementId);
            element.classList.add(className);
        },
        removeClass(elementId, className) {
            const element = document.getElementById(elementId);
            element.classList.remove(className);
        },
        setInnerHtml(elementId, innerHTML) {
            const element = document.getElementById(elementId);
            element.innerHTML = innerHTML;
        },
        setAttribute(elementId, attributeName, attributeValue) {
            const element = document.getElementById(elementId);
            element.setAttribute(attributeName, attributeValue);
        },
        updateInventory(player) {
            let i = 1;
            player.inventory.forEach(item => {
                const weaponAccuracyPercent = item.weaponAccuracy * 100
                this.setInnerHtml(`${player.id}Inventory${i}`, `<div class="icon inventory tool-tip ${item.id}"><img class="icon" 
                src="assets/${item.id}.svg"><span class="tool-tip-text">${item.id}<br>${item.description}</span></div>`);
                i++;
            })
            for (i; i <= 3; i++) {
                this.removeClass(`${player.id}Inventory${i}`, "inventory");
                this.setInnerHtml(`${player.id}Inventory${i}`, "");
            }
        },
        updateCell(y, x, cell = game.grid[y][x]) {
            const parentCell = document.getElementById(`row-${y}`);
            const child = parentCell.childNodes[x]
            child.innerHTML = "";
            if (cell.length > 0) {
                if (cell[0].type === "player") {
                    child.innerHTML =
                        `<div class="icon tool-tip ${cell[0].id}"><img src="assets/${cell[0].id}.svg">
                <span class="tool-tip-text">${cell[0].username}<br>${cell[0].description}</span></div>`;
                } else {
                    child.innerHTML =
                        `<div class="icon tool-tip ${cell[0].id}"><img src="assets/${cell[0].id}.svg">
                <span class="tool-tip-text">${cell[0].id}<br>${cell[0].description}</span></div>`;
                }
            }
        },
        updateStatsbar() {
            game.players.forEach(player => {
                const healthbar = document.getElementById(`${player.id}Health`);
                healthbar.innerHTML = player.health;
                healthbar.style.width = `${player.health}%`;
                const defencebar = document.getElementById(`${player.id}Defence`);
                defencebar.innerHTML = player.defence;
                defencebar.style.width = `${player.defence}%`;
            })
        },
    },
    gridGenerate(rows, columns) {
        const container = document.getElementById("gameMap")
        container.innerHTML = ""
        for (i = 0; i < rows; i++) {
            this.grid.push([]);
            container.insertAdjacentHTML("beforeend", `<div class="row" id="row-${i}"></div>`);
            const rowContainer = document.getElementById(`row-${i}`);
            for (j = 0; j < columns; j++) {
                this.grid[i].push([]);
                rowContainer.insertAdjacentHTML("beforeend", `<div class="col border min-height-4 px-0" id="col-${j}"></div>`)
            }
        }
    },
    newCustomGame() {
        const player1Username = document.getElementById("player1Username").value;
        const player2Username = document.getElementById("player2Username").value;
        const userMapRow = document.getElementById("userMapRow").value;
        const userMapCol = document.getElementById("userMapCol").value;
        const userWeaponNo = document.getElementById("userWeaponNo").value;
        const userObsticleNo = document.getElementById("userObsticleNo").value;
        this.newGame(userMapRow, userMapCol, userObsticleNo, userWeaponNo, player1Username, player2Username);
        this.elements.setInnerHtml("player1TurnUsername", `${this.player1.username}'s Turn`);
        this.elements.setInnerHtml("player2TurnUsername", `${this.player2.username}'s Turn`);
        this.elements.setInnerHtml("player1InventoryTitle", `${this.player1.username}'s Inventory`)
        this.elements.setInnerHtml("player2InventoryTitle", `${this.player2.username}'s Inventory`)
    },
    newGame(mapRows = 8, mapColumns = 20, obsticleNo = 30, weaponNo = 5, username1 = "player1", username2 = "player2") {
        //clear previous game data
        this.grid = [], this.items = [], this.players = [], this.turnCount = 1;
        //generate new map
        this.gridGenerate(mapRows, mapColumns);
        //obsticles
        for (i = 1; i <= (obsticleNo / 2); i++) {
            this.items.push(new this.Item(`mountains`, "obsticle"));
            this.items.push(new this.Item(`trees`, "obsticle"));
        };
        //weapons        
        for (i = 0; i <= (weaponNo - 1); i++) {
            let weaponDamage = 50 - 5 * i;
            let weaponAccuracy = Math.round((1 - 0.7 / (i + 1)) * 100) / 100;
            this.items.push(new this.Item(`${this.weapons[i]}`, "weapon", weaponDamage, weaponAccuracy));
        };
        //players
        this.player1 = new this.Item("player1", "player");
        this.player2 = new this.Item("player2", "player");
        this.player1.username = username1;
        this.player2.username = username2;
        this.player1.inventory.push(new this.Item("knife", "weapon", 10, 1));
        this.player2.inventory.push(new this.Item("knife", "weapon", 10, 1));
        this.items.push(this.player1, this.player2);
        this.players.push(this.player1, this.player2);
        //randomly place items in grid
        this.assignRandomXY(mapRows, mapColumns, this.items);
        this.elements.updateInventory(this.player1);
        this.elements.updateInventory(this.player2);
        this.elements.updateStatsbar()

        this.generateAllowedMovement(this.player1, mapRows, mapColumns);
        ["gameMap", "gameInventory", "player1Inventory", "player2Inventory"].forEach(element => {
            this.elements.show(element);
        });
        ["gameRules", "gameCustomize", "gameFight", "congratWinner", "player1InventoryWin", "player2InventoryWin"].forEach(item => {
            this.elements.hide(item);
        });
        this.hideCustomize();
        this.hideRules();
    },
    Item: function (id, type, weaponDamage, weaponAccuracy, y = 0, x = 0) {
        this.id = id;
        this.type = type;
        this.y = y;
        this.x = x;
        if (type === "player") {
            this.inventory = [];
            this.health = 100;
            this.defence = 0;
            this.description = "A fierce Viking";
        }
        if (type === "weapon") {
            this.weaponDamage = weaponDamage;
            this.weaponAccuracy = weaponAccuracy;
            const accuracyAsPercent = this.weaponAccuracy * 100
            this.description = `Damage: ${this.weaponDamage}<br>Accuracy: ${accuracyAsPercent}%`;
        }
        if (type === "obsticle") {
            this.description = "You cannot pass!";
        }
    },
    assignRandomXY(mapRows, mapColumns, itemArray) {
        let randomLocation = [], randomRow, randomColumn;
        for (i = 0; i < itemArray.length; i++) {
            do {
                randomRow = Math.floor(Math.random() * mapRows);
                randomColumn = Math.floor(Math.random() * mapColumns);
                randomLocation = this.grid[randomRow][randomColumn];
            } while (randomLocation.length > 0);
            itemArray[i].y = randomRow;
            itemArray[i].x = randomColumn;
            this.grid[randomRow][randomColumn].push(itemArray[i]);
            this.elements.updateCell(randomRow, randomColumn);
        }
    },
    generateAllowedMovement(player, mapRows = this.grid.length, mapColumns = this.grid[0].length, movementLength = 3) {
        //remove class & attributes previous allowed locations
        this.allowedMovement.forEach(item => {
            const parentContainer = document.getElementById(`row-${item[0]}`)
            const allowedMovement = parentContainer.childNodes[item[1]]
            allowedMovement.classList.remove("allowedMovement", "border-success")
            allowedMovement.removeAttribute("onclick")
        })
        //clear the allowed movement array
        this.allowedMovement = [];

        //north possible moves (y-i) -------------------------------------------------------
        for (i = 1; i <= movementLength; i++) {
            if (player.y - i < 0) {
                break;
            }
            if (this.checkAllowedMovement(player.y - i, player.x, i) == false) {
                break;
            }
            else {
                this.allowedMovement.push([player.y - i, player.x])
            }
        }
        //south possible moves (y+i) -------------------------------------------------------
        for (i = 1; i <= movementLength; i++) {
            if (player.y + i >= mapRows) {
                break;
            }
            if (this.checkAllowedMovement((player.y + i), player.x, i) == false) {
                break;
            }
            else {
                this.allowedMovement.push([player.y + i, player.x])
            }
        }
        //east possible moves (x+i) -------------------------------------------------------
        for (i = 1; i <= movementLength; i++) {
            if (player.x + i >= mapColumns) {
                break;
            }
            if (this.checkAllowedMovement((player.y), player.x + i, i) == false) {
                break;
            }
            else {
                this.allowedMovement.push([player.y, player.x + i])
            }
        }
        //west possible moves (x-i) -------------------------------------------------------
        for (i = 1; i <= movementLength; i++) {
            if (player.x - i < 0) {
                break;
            }
            if (this.checkAllowedMovement((player.y), player.x - i, i) == false) {
                break;
            }
            else {
                this.allowedMovement.push([player.y, player.x - i])
            }
        }

        //give allowed location cells the allowedMovement class and onClick=move attribute
        this.allowedMovement.forEach(item => {
            const parentLocation = document.getElementById(`row-${item[0]}`)
            const allowedMovement = parentLocation.childNodes[item[1]]
            allowedMovement.classList.add("allowedMovement", "border-success")
            allowedMovement.setAttribute("onclick", "game.move(this.parentElement.id, this.id)")
        })
    },
    checkAllowedMovement: function (y, x, i) {
        if (this.grid[y][x].length < 1) {
            return true
        } else if (this.grid[y][x][0].type == "weapon") {
            return true;
        } else if (this.grid[y][x][0].type == "player" && i == 1) {
            if (this.turnCount === 1) {
                console.log("players spawned too close, the game has reloaded")
                this.newGame();
            } else {
                console.log("***Initiate FIGHT***");
                this.endOfGo("fight")
                this.initiateFight();
                return false;
            }
        } else return false;
    },
    move(rowId, colId, item = this.players[0], previousY = item.y, previousX = item.x) {
        //convert element id of clicked square into coordinates
        rowId = rowId.substring(4, 6);
        const y = Number.parseInt(rowId);
        colId = colId.substring(4, 6);
        const x = Number.parseInt(colId);
        this.gridItemCheck(previousY, previousX, y, x, item)
        //add player into grid array in their new postion
        this.grid[y][x].unshift(item);
        //remove player from their previous location in the grid array
        this.grid[previousY][previousX] = this.grid[previousY][previousX].filter(element => element.id !== item.id);
        //update elements in the DOM accordingly
        this.elements.updateCell(y, x);
        this.elements.updateCell(previousY, previousX);
        //update location of player in the players array
        this.players[0].y = y;
        this.players[0].x = x;
        this.endOfGo()
        //update allowed movement for the next players turn
        this.generateAllowedMovement(this.players[0]);
    },
    gridItemCheck(startY, startX, endY, endX, player = this.players[0]) {
        //generate an array of squares moved through
        const movementRange = []
        if (startY === endY) {
            if (startX < endX) {
                for (i = 1; i <= endX - startX; i++) {
                    movementRange.push([startY, startX + i])
                }
            }
            if (startX > endX) {
                for (i = -1; i >= endX - startX; i--) {
                    movementRange.push([startY, startX + i])
                }
            }
        }
        if (startX === endX) {
            if (startY < endY) {
                for (i = 1; i <= endY - startY; i++) {
                    movementRange.push([startY + i, startX]);
                }
            }
            if (startY > endY) {
                for (i = -1; i >= endY - startY; i--) {
                    movementRange.push([startY + i, startX]);
                }
            }
        }
        movementRange.forEach(element => {
            const location = this.grid[element[0]][element[1]];
            location.forEach(element => {
                i = 0;
                if (element.type === "weapon") {
                    const oldWeapon = player.inventory.find(element => element.type === "weapon");
                    const newWeapon = element;
                    player.inventory = player.inventory.filter(item => item.type !== "weapon");
                    player.inventory.push(newWeapon);
                    location[i] = oldWeapon;
                    this.elements.updateInventory(player);
                }
                i++;
            })
            this.elements.updateCell(element[0], element[1])
        })
    },
    endOfGo(gameStage) {
        this.elements.hide(`${this.players[0].id}Icon`)
        this.elements.show(`${this.players[1].id}Icon`)
        if (gameStage === "fight") {
            this.elements.hide(`${this.players[0].id}Inventory`);
            this.elements.show(`${this.players[1].id}Inventory`);
            this.elements.hide(`${this.players[0].id}Turn`);
            this.elements.show(`${this.players[1].id}Turn`);
            if (this.players[1].defence >= 10) {
                this.players[1].defence -= 10;
            }
            this.elements.updateStatsbar();
        }
        this.players.reverse();
        this.turnCount++;
    },
    initiateFight() {
        this.elements.hide("gameMap");
        this.elements.show("gameFight");
        this.elements.show(`${this.players[0].id}Turn`);
        this.elements.hide(`${this.players[1].id}Inventory`);
    },
    attack(attackingPlayer = this.players[0], defendingPlayer = this.players[1], weapon = this.players[0].inventory[0]) {
        if (Math.random() > weapon.weaponAccuracy) {
            console.log(`${attackingPlayer.id} attacks ${defendingPlayer.id} with ${weapon.id}, but misses!`)
        } else {
            weaponDamage = weapon.weaponDamage - (weapon.weaponDamage * defendingPlayer.defence / 100)
            console.log(`${attackingPlayer.username} attacks ${defendingPlayer.username} with ${weapon.id} and hits ${weaponDamage} damage`)
            defendingPlayer.health -= weaponDamage;
        }
        this.endOfGo("fight");
        if (defendingPlayer.health <= 0) {
            defendingPlayer.health = 0;
            this.elements.updateStatsbar();
            this.winningPlayer(attackingPlayer, defendingPlayer);
        }
    },
    defend() {
        this.players[0].defence = 50;
        this.endOfGo("fight");
    },
    winningPlayer(winningPlayer, losingPlayer) {
        this.elements.setInnerHtml("gameFightJumbotron", `Congratulations ${winningPlayer.username}`)
        this.elements.setInnerHtml("gameFightJumbotronSubText", "You are the Winner!")
        this.elements.hide(`${losingPlayer.id}Turn`)
        this.elements.show(`${winningPlayer.id}Icon`)
        this.elements.show("congratWinner", "flex")
        this.elements.setInnerHtml("winnerIcon", `<img src="assets/${winningPlayer.id}.svg" class="min-height-15">`)
        this.elements.show(`${winningPlayer.id}InventoryWin`)
    },
    showRules() {
        $(document).ready(function () {
            $("#gameRules").fadeIn(1000);
        });
        const navBtnRules = document.getElementById("navBtnRules");
        navBtnRules.classList.add("active");
        navBtnRules.setAttribute("onclick", "game.hideRules()");
        navBtnRules.childNodes[1].data = "Hide Rules";
    },
    hideRules() {
        $(document).ready(function () {
            $("#gameRules").fadeOut(1000);
        });
        const navBtnRules = document.getElementById("navBtnRules");
        navBtnRules.classList.remove("active");
        navBtnRules.setAttribute("onclick", "game.showRules()");
        navBtnRules.childNodes[1].data = "Show Rules";
    },
    showCustomize() {
        $(document).ready(function () {
            $("#gameCustomize").fadeIn(1000);
        });
        const navBtnCustomize = document.getElementById("navBtnCustomize");
        navBtnCustomize.classList.add("active");
        navBtnCustomize.setAttribute("onclick", "game.hideCustomize()");
        navBtnCustomize.childNodes[1].data = "Hide Custom";
    },
    hideCustomize() {
        $(document).ready(function () {
            $("#gameCustomize").fadeOut(1000);
        });
        const navBtnCustomize = document.getElementById("navBtnCustomize");
        navBtnCustomize.classList.remove("active");
        navBtnCustomize.setAttribute("onclick", "game.showCustomize()");
        navBtnCustomize.childNodes[1].data = "Custom Game";
    },
}