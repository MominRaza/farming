<!-- always sync with constants.ts -->

# 🎮 Coin System

## 💰 Starting Resources
- **Starting Coins**: 300 coins
- **Starting Area**: Area (0,0) - 12x12 tiles (144 tiles total)

---

### 🏗️ Terrain Building
| Icon | Item | Cost |
|------|------|------|
| 🟫 | Soil | 3 coins |
| 🛤️ | Road | 8 coins |

### 🌱 Crop Seeds
| # | Icon | Crop | Cost | Harvest Value | Net Profit | Growth Time | Coins/Second |
|---|------|------|------|---------------|------------|-------------|--------------|
| 1 | 🌾 | Wheat | 12 coins | 20 coins | +8 coins | 25 seconds | 0.32 |
| 2 | 🥬 | Spinach | 8 coins | 15 coins | +7 coins | 18 seconds | 0.39 |
| 3 | � | Carrots | 15 coins | 25 coins | +10 coins | 30 seconds | 0.33 |
| 4 | 🥔 | Potatoes | 10 coins | 18 coins | +8 coins | 22 seconds | 0.36 |
| 5 | � | Tomatoes | 20 coins | 35 coins | +15 coins | 35 seconds | 0.43 |
| 6 | 🌽 | Corn | 25 coins | 45 coins | +20 coins | 40 seconds | 0.50 |
| 7 | 🧅 | Onions | 18 coins | 32 coins | +14 coins | 45 seconds | 0.31 |
| 8 | 🫛 | Pea | 16 coins | 28 coins | +12 coins | 28 seconds | 0.43 |
| 9 | 🍆 | Eggplant | 30 coins | 55 coins | +25 coins | 50 seconds | 0.50 |
| 10 | 🌶️ | Peppers | 35 coins | 65 coins | +30 coins | 55 seconds | 0.55 |

*Note: All crops have 5 growth stages*

### 🚿 Crop Enhancement Tools
| Icon | Tool | Cost | Effect | Duration/Support |
|------|------|------|--------|----------|
| 💧 | Water | 5 coins | +30% growth speed | 60 seconds |
| 🌱 | Fertilize | 15 coins | +50% growth speed | 3 crops |
| ✋ | Harvest | 0 coins | Free to harvest mature crops | - |

### 🗺️ Area Expansion
| Distance from Origin | Cost Formula | Example Costs |
|---------------------|--------------|---------------|
| Adjacent to (0,0) | 200 + (distance × 100) | Area (1,0): 300 coins |
| Distance 2 | 200 + (distance × 100) | Area (2,0): 400 coins |
| Distance 3 | 200 + (distance × 100) | Area (0,3): 500 coins |
| Distance 4 | 200 + (distance × 100) | Area (2,2): 600 coins |
