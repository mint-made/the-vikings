## The Vikings - A turn-based JavaScript board game (2018)
### Project Overview
This project, completed in late 2018 is a Vikings themed turn-based board game in which two players can move up to 3 squares north, east, south or west to collect new weapons. When a player comes within one adjacent square of their opponent, a fight is initiated and the two players will fight to the death taking turns to attack or defend against their opponent. The warrior left standing is crowned victorious. The board game and the logic behind the game was written with JavaScript alone, with jQuery used for page transitions and Bootstrap used as a CSS libary for the project. **[Project Website](https://www.mint-made.com/the-vikings "The Vikings - Turn Based Board Game")**

### Technologies Utilized
- HTML / CSS
- JavaScript
- Bootstrap

## Game Rules
### Movement
- Players take it in turns to move and can move from 1-3 squares horizontally or vertically
- Players cannot move through obsticles tiles containing obsticles such as trees and mountains
- A player can only hold one weapon in his inventory at a time
- When a player walks over a tile containing a new weapon, the player will add the new weapon to their inventory and drop their old weapon on that tile
- When a player moves adjacent(vertically or horizontally) to another player, a fight between the two players will start!

### Weapons
- Each player starts with a knife. This is a basic weapon that deals 10 damange and has an accuracy of 100%, so will always deal damage to the other player
- Other weapons have accuracy less than 100% and thus have a chance to miss their opponent, however these weapons deal a lot more damage
- To look at the details of a weapon or item in the game, hover your curser over it to view the stats of it. 

### The Battle
- Each player takes it in turns to fight, with the option to attack or defend.
- Defending increases a players defence by 50, which reduces the damage received by 50% that turn.
- A players defence reduces by 10 each turn. After defending, the player would have the following defence for the next 5 turns: 50, 40, 30, 20, 10.
- If a player attacks, depending on the player's weapon accuracy if their attack is successful, they will deal damage to their opponent.
- The first player to reduce their opponents health to 0 is the winner.
