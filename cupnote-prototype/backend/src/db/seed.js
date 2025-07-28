const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const db = require('./index');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Create test user
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    
    const testUserId = uuidv4();
    await db.query(
      `INSERT INTO users (id, email, password_hash, username, preferred_mode)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      [testUserId, 'test@cupnote.com', passwordHash, 'TestUser', 'brew']
    );

    // Create sample coffees
    const coffees = [
      {
        name: 'Ethiopia Yirgacheffe',
        roaster: 'Blue Bottle Coffee',
        origin: 'Ethiopia',
        process: 'Washed',
        roast_date: new Date('2024-01-15'),
        variety: 'Heirloom',
        altitude: '1800-2200m',
        tasting_notes: ['Blueberry', 'Lemon', 'Floral']
      },
      {
        name: 'Colombia Geisha',
        roaster: 'Onyx Coffee Lab',
        origin: 'Colombia',
        process: 'Natural',
        roast_date: new Date('2024-01-20'),
        variety: 'Geisha',
        altitude: '1700-1900m',
        tasting_notes: ['Jasmine', 'Bergamot', 'Honey']
      },
      {
        name: 'Kenya AA',
        roaster: 'Coffee Collective',
        origin: 'Kenya',
        process: 'Double Washed',
        roast_date: new Date('2024-01-18'),
        variety: 'SL28, SL34',
        altitude: '1600-1800m',
        tasting_notes: ['Black Currant', 'Wine', 'Bright']
      }
    ];

    const coffeeIds = [];
    for (const coffee of coffees) {
      const result = await db.query(
        `INSERT INTO coffees (name, roaster, origin, process, roast_date, variety, altitude, tasting_notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [coffee.name, coffee.roaster, coffee.origin, coffee.process, coffee.roast_date, 
         coffee.variety, coffee.altitude, coffee.tasting_notes]
      );
      coffeeIds.push(result.rows[0].id);
    }

    // Create sample tasting notes
    const tastingNotes = [
      {
        coffee_id: coffeeIds[0],
        mode: 'brew',
        brew_method: 'V60',
        water_temp: 93,
        grind_size: 'Medium',
        brew_time: '2:30',
        coffee_weight: 15,
        water_weight: 250,
        brew_ratio: '1:16.7',
        timer_laps: [
          { lap_number: 1, label: '뜸들이기 (Blooming)', duration: 30000, total_time: 30000 },
          { lap_number: 2, label: '1차 추출', duration: 40000, total_time: 70000 },
          { lap_number: 3, label: '2차 추출', duration: 50000, total_time: 120000 }
        ],
        overall_score: 5,
        flavor_notes: ['Blueberry', 'Lemon', 'Bright'],
        aroma: 5,
        acidity: 4,
        body: 3,
        aftertaste: 4,
        balance: 5,
        mouthfeel: 8,
        personal_notes: '크림처럼 부드러운 마우스필에 블루베리의 산미가 훌륭했다.'
      },
      {
        coffee_id: coffeeIds[1],
        mode: 'cafe',
        cafe_name: 'Onyx Coffee Lab Seoul',
        cafe_location: 'Gangnam, Seoul',
        menu_item: 'Pour Over',
        overall_score: 4,
        flavor_notes: ['Jasmine', 'Honey', 'Sweet'],
        aroma: 5,
        acidity: 3,
        body: 4,
        aftertaste: 4,
        balance: 4,
        mouthfeel: 7,
        personal_notes: '카페에서 마신 커피 중 최고. 자스민 향이 인상적.'
      }
    ];

    for (const note of tastingNotes) {
      await db.query(
        `INSERT INTO tasting_notes (
          user_id, coffee_id, mode, cafe_name, cafe_location, menu_item,
          brew_method, water_temp, grind_size, brew_time, coffee_weight,
          water_weight, brew_ratio, timer_laps, overall_score, flavor_notes,
          aroma, acidity, body, aftertaste, balance, mouthfeel, personal_notes
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, $20, $21, $22, $23
        )`,
        [
          testUserId, note.coffee_id, note.mode, note.cafe_name, note.cafe_location,
          note.menu_item, note.brew_method, note.water_temp, note.grind_size,
          note.brew_time, note.coffee_weight, note.water_weight, note.brew_ratio,
          JSON.stringify(note.timer_laps), note.overall_score, note.flavor_notes,
          note.aroma, note.acidity, note.body, note.aftertaste, note.balance,
          note.mouthfeel, note.personal_notes
        ]
      );
    }

    // Create sample achievements
    const achievements = [
      {
        name: 'First Taste',
        description: 'Record your first tasting note',
        icon: '🎉',
        category: 'tasting',
        requirement_type: 'count',
        requirement_value: 1,
        points: 10
      },
      {
        name: 'Coffee Explorer',
        description: 'Taste 10 different coffees',
        icon: '🌍',
        category: 'exploration',
        requirement_type: 'count',
        requirement_value: 10,
        points: 50
      },
      {
        name: 'Brew Master',
        description: 'Create 5 brew recipes',
        icon: '☕',
        category: 'brewing',
        requirement_type: 'count',
        requirement_value: 5,
        points: 30
      },
      {
        name: 'Consistency King',
        description: 'Log tastings for 7 days in a row',
        icon: '👑',
        category: 'tasting',
        requirement_type: 'streak',
        requirement_value: 7,
        points: 40
      }
    ];

    for (const achievement of achievements) {
      await db.query(
        `INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, points)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT DO NOTHING`,
        [achievement.name, achievement.description, achievement.icon, achievement.category,
         achievement.requirement_type, achievement.requirement_value, achievement.points]
      );
    }

    console.log('✅ Database seeding completed successfully');
    console.log('🔑 Test user created: test@cupnote.com / password123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();