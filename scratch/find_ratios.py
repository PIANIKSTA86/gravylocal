# Let's test the numbers from ENT-0003:
# Product 1: Gran Chaco: qty 806.40, total = 49,631,547.79, unit = 61,547.058
# Product 2: Mamore: qty 864.00, total = 14,945,389.02, unit = 17,297.904
# Product 3: Destello: qty 806.40, total = 13,949,029.75, unit = 17,297.904
# Product 4: Opulenza: qty 576.00, total = 9,674,327.09, unit = 16,795.707
# Product 5: Opulenza Marron: qty 748.80, total = 8,732,606.87, unit = 11,662.135
# Product 6: Numa Grey: qty 172.80, total = 2,863,729.38, unit = 16,572.508

# Notice:
# Sum of totals = 99,796,629.90 (EXACTLY the same grand total!)
# In Image 1, Gastos Prorrateados total was 28,257,429.90.
# FOB total was 71,539,200.00 COP (17,884.80 USD * 4,000).

# If total was 99,796,629.90:
# How did Gran Chaco get 49,631,547.79?
# 49,631,547.79 / 99,796,629.90 = 0.497326892 (49.7327%)
# 14,945,389.02 / 99,796,629.90 = 0.149758454 (14.9758%)
# 13,949,029.75 / 99,796,629.90 = 0.139774557 (13.9775%)
# 9,674,327.09 / 99,796,629.90 = 0.096940419 (9.6940%)
# 8,732,606.87 / 99,796,629.90 = 0.087504026 (8.7504%)
# 2,863,729.38 / 99,796,629.90 = 0.028695652 (2.8696%)

# What are those ratios?
# Total weight = 15512 + 16620 + 15512 + 11080 + 14404 + 3324 = 76,452 kg.
# Weight ratios:
# 15512 / 76452 = 20.2898%
# 16620 / 76452 = 21.7391%
# ... so it's NOT gross weight!

# What about CBM?
# Total CBM = 25.2 + 27.0 + 25.2 + 18.0 + 23.4 + 5.4 = 124.2 m3.
# CBM ratios:
# 25.2 / 124.2 = 20.2898%
# Same as weight!

# What about FOB value?
# If FOB was $4.50 for all, FOB ratios = qty ratios:
# 806.4 / 3974.4 = 20.2898%

# So under standard FOB_VALUE, GROSS_WEIGHT, or CUBIC_VOLUME with the CURRENT line data,
# EVERY LINE GETS 25,109.86!

# So where did 49.73%, 14.97%, 13.97%, 9.69%, 8.75%, 2.87% come from?!
