/**
 * MicroMind Base Template — Phase 1 Seed Script
 * 
 * Generates idempotent demo organizations, users, categories,
 * active budgets, financial goals, and a realistic 6-month EGP transaction history.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting Phase 1 Foundation database seed...');

    // ============================================================================
    // 1. CREATE DEMO ORGANIZATIONS
    // ============================================================================
    console.log('\n📦 Creating organizations...');

    const org1 = await prisma.organization.upsert({
        where: { slug: 'acme-corp' },
        update: {},
        create: {
            name: 'Acme Personal Finance',
            slug: 'acme-corp',
            settings: {
                timezone: 'Africa/Cairo',
                currency: 'EGP'
            }
        }
    });
    console.log('✅ Created organization:', org1.name);

    const org2 = await prisma.organization.upsert({
        where: { slug: 'micromind-labs' },
        update: {},
        create: {
            name: 'MicroMind Labs',
            slug: 'micromind-labs',
            settings: {
                timezone: 'UTC',
                currency: 'USD'
            }
        }
    });
    console.log('✅ Created organization:', org2.name);

    // ============================================================================
    // 2. CREATE USERS
    // ============================================================================
    console.log('\n👥 Creating users...');

    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@acme.com' },
        update: {
            currentOrganizationId: org1.id,
            currency: 'EGP'
        },
        create: {
            email: 'admin@acme.com',
            passwordHash: adminPassword,
            displayName: 'Sherif Admin',
            role: 'ADMIN',
            active: true,
            currentOrganizationId: org1.id,
            currency: 'EGP',
            safetyReserve: 30000,
            monthlyIncomeTarget: 35000
        }
    });
    console.log('✅ Created admin user:', admin.email);

    const userPassword = await bcrypt.hash('user123', 10);
    const user = await prisma.user.upsert({
        where: { email: 'user@acme.com' },
        update: {
            currentOrganizationId: org1.id,
            currency: 'EGP'
        },
        create: {
            email: 'user@acme.com',
            passwordHash: userPassword,
            displayName: 'Kareem Tarek',
            role: 'USER',
            active: true,
            currentOrganizationId: org1.id,
            currency: 'EGP',
            safetyReserve: 25000,
            monthlyIncomeTarget: 28000
        }
    });
    console.log('✅ Created demo user:', user.email);

    const user2Password = await bcrypt.hash('user123', 10);
    const user2 = await prisma.user.upsert({
        where: { email: 'jane@micromind.com' },
        update: {
            currentOrganizationId: org2.id,
            currency: 'USD'
        },
        create: {
            email: 'jane@micromind.com',
            passwordHash: user2Password,
            displayName: 'Jane Smith',
            role: 'USER',
            active: true,
            currentOrganizationId: org2.id,
            currency: 'USD'
        }
    });
    console.log('✅ Created user:', user2.email);

    // ============================================================================
    // 3. CREATE ORGANIZATION MEMBERSHIPS
    // ============================================================================
    console.log('\n🔗 Creating organization memberships...');

    await prisma.organizationMember.upsert({
        where: { organizationId_userId: { organizationId: org1.id, userId: admin.id } },
        update: {},
        create: { organizationId: org1.id, userId: admin.id, role: 'OWNER' }
    });

    await prisma.organizationMember.upsert({
        where: { organizationId_userId: { organizationId: org1.id, userId: user.id } },
        update: {},
        create: { organizationId: org1.id, userId: user.id, role: 'MEMBER' }
    });

    await prisma.organizationMember.upsert({
        where: { organizationId_userId: { organizationId: org2.id, userId: user2.id } },
        update: {},
        create: { organizationId: org2.id, userId: user2.id, role: 'OWNER' }
    });

    // ============================================================================
    // 4. CREATE SUBSCRIPTIONS
    // ============================================================================
    console.log('\n💳 Creating subscriptions...');
    const now = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await prisma.subscription.upsert({
        where: { organizationId: org1.id },
        update: {},
        create: {
            organizationId: org1.id,
            plan: 'PRO',
            status: 'ACTIVE',
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd
        }
    });

    await prisma.subscription.upsert({
        where: { organizationId: org2.id },
        update: {},
        create: {
            organizationId: org2.id,
            plan: 'FREE',
            status: 'ACTIVE',
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd
        }
    });

    // ============================================================================
    // 5. CLEANUP EXISTING PERSONAL FINANCE SEED DATA FOR IDEMPOTENCY
    // ============================================================================
    console.log('\n🧹 Cleaning up previous personal finance demo data...');
    await prisma.transaction.deleteMany({ where: { organizationId: org1.id } });
    await prisma.budget.deleteMany({ where: { organizationId: org1.id } });
    await prisma.financialGoal.deleteMany({ where: { organizationId: org1.id } });
    await prisma.category.deleteMany({ where: { organizationId: org1.id } });

    // ============================================================================
    // 6. SEED DEFAULT CATEGORIES FOR ORG1
    // ============================================================================
    console.log('\n🏷️  Seeding categories for Acme Personal Finance...');

    const categoryDefs = [
        // Income Categories
        { name: 'Salary', icon: 'Briefcase', color: '#10B981', type: 'INCOME', isDefault: true },
        { name: 'Freelance & Consulting', icon: 'Laptop', color: '#3B82F6', type: 'INCOME', isDefault: true },
        { name: 'Investments', icon: 'TrendingUp', color: '#8B5CF6', type: 'INCOME', isDefault: true },
        { name: 'Other Income', icon: 'PlusCircle', color: '#6B7280', type: 'INCOME', isDefault: true },

        // Expense Categories
        { name: 'Housing & Rent', icon: 'Home', color: '#E0AA3E', type: 'EXPENSE', isDefault: true },
        { name: 'Food & Groceries', icon: 'ShoppingCart', color: '#10B981', type: 'EXPENSE', isDefault: true },
        { name: 'Food Delivery', icon: 'UtensilsCrossed', color: '#F59E0B', type: 'EXPENSE', isDefault: true },
        { name: 'Transportation', icon: 'Car', color: '#3B82F6', type: 'EXPENSE', isDefault: true },
        { name: 'Bills & Utilities', icon: 'Zap', color: '#EC4899', type: 'EXPENSE', isDefault: true },
        { name: 'Shopping & Apparel', icon: 'ShoppingBag', color: '#8B5CF6', type: 'EXPENSE', isDefault: true },
        { name: 'Entertainment & Leisure', icon: 'Film', color: '#6366F1', type: 'EXPENSE', isDefault: true },
        { name: 'Subscriptions & Services', icon: 'Repeat', color: '#14B8A6', type: 'EXPENSE', isDefault: true },
        { name: 'Healthcare & Fitness', icon: 'HeartPulse', color: '#EF4444', type: 'EXPENSE', isDefault: true },
        { name: 'Education', icon: 'GraduationCap', color: '#06B6D4', type: 'EXPENSE', isDefault: true },
        { name: 'Other Expenses', icon: 'MoreHorizontal', color: '#9CA3AF', type: 'EXPENSE', isDefault: true }
    ];

    const categoryMap = {};
    for (const catDef of categoryDefs) {
        const created = await prisma.category.create({
            data: {
                organizationId: org1.id,
                ...catDef
            }
        });
        categoryMap[`${catDef.name}_${catDef.type}`] = created.id;
    }
    console.log(`✅ Created ${categoryDefs.length} categories`);

    // ============================================================================
    // 7. SEED 6-MONTH REALISTIC EGP TRANSACTIONS
    // ============================================================================
    console.log('\n💳 Generating 6 months of realistic personal transactions in EGP...');

    const transactionsToInsert = [];
    const baseYear = now.getUTCFullYear();
    const baseMonth = now.getUTCMonth(); // 0-indexed current month

    // Generate month-by-month transactions (Month index 5 = current month, Month 0 = 5 months ago)
    for (let m = 0; m < 6; m++) {
        const monthOffset = 5 - m; // 5 months ago down to 0 (current)
        const targetDateObj = new Date(Date.UTC(baseYear, baseMonth - monthOffset, 1));
        const y = targetDateObj.getUTCFullYear();
        const mo = targetDateObj.getUTCMonth(); // 0-11

        // 1. Primary Monthly Salary (28,000 EGP on 1st of month)
        transactionsToInsert.push({
            organizationId: org1.id,
            userId: user.id,
            amount: 28000,
            type: 'INCOME',
            categoryId: categoryMap['Salary_INCOME'],
            merchant: 'Tech Innovations LLC',
            date: new Date(Date.UTC(y, mo, 1, 10, 0, 0)),
            paymentMethod: 'BANK_TRANSFER',
            description: `Monthly Salary - ${targetDateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' })}`,
            isRecurring: true,
            recurringPeriod: 'MONTHLY'
        });

        // 2. Freelance income in selected months
        if (m === 1) { // Month 2
            transactionsToInsert.push({
                organizationId: org1.id,
                userId: user.id,
                amount: 4500,
                type: 'INCOME',
                categoryId: categoryMap['Freelance & Consulting_INCOME'],
                merchant: 'Fintech Advisory Client',
                date: new Date(Date.UTC(y, mo, 14, 15, 30, 0)),
                paymentMethod: 'BANK_TRANSFER',
                description: 'UI/UX Consulting Project Phase 1'
            });
        } else if (m === 3) { // Month 4
            transactionsToInsert.push({
                organizationId: org1.id,
                userId: user.id,
                amount: 6000,
                type: 'INCOME',
                categoryId: categoryMap['Freelance & Consulting_INCOME'],
                merchant: 'Global Tech Corp',
                date: new Date(Date.UTC(y, mo, 18, 12, 0, 0)),
                paymentMethod: 'BANK_TRANSFER',
                description: 'API Integration Project'
            });
        } else if (m === 4) { // Month 5
            transactionsToInsert.push({
                organizationId: org1.id,
                userId: user.id,
                amount: 3500,
                type: 'INCOME',
                categoryId: categoryMap['Freelance & Consulting_INCOME'],
                merchant: 'Local Retailer',
                date: new Date(Date.UTC(y, mo, 22, 11, 0, 0)),
                paymentMethod: 'BANK_TRANSFER',
                description: 'E-commerce Consultation'
            });
        }

        // 3. Fixed Housing / Rent (8,500 EGP on 2nd of month)
        transactionsToInsert.push({
            organizationId: org1.id,
            userId: user.id,
            amount: 8500,
            type: 'EXPENSE',
            categoryId: categoryMap['Housing & Rent_EXPENSE'],
            merchant: 'Property Management Co.',
            date: new Date(Date.UTC(y, mo, 2, 11, 0, 0)),
            paymentMethod: 'BANK_TRANSFER',
            description: 'Apartment Monthly Rent (Zamalek)',
            isRecurring: true,
            recurringPeriod: 'MONTHLY'
        });

        // 4. Utilities & Bills (Electricity, Water, Gas, Fiber Internet)
        transactionsToInsert.push({
            organizationId: org1.id,
            userId: user.id,
            amount: 1150 + (m * 40),
            type: 'EXPENSE',
            categoryId: categoryMap['Bills & Utilities_EXPENSE'],
            merchant: 'Electricity & Utility Authority (Fawry)',
            date: new Date(Date.UTC(y, mo, 5, 9, 30, 0)),
            paymentMethod: 'E_WALLET',
            description: 'Monthly electricity and utility bills'
        });

        transactionsToInsert.push({
            organizationId: org1.id,
            userId: user.id,
            amount: 650,
            type: 'EXPENSE',
            categoryId: categoryMap['Bills & Utilities_EXPENSE'],
            merchant: 'Telecom Egypt (WE Internet)',
            date: new Date(Date.UTC(y, mo, 6, 10, 15, 0)),
            paymentMethod: 'CARD',
            description: 'VDSL Ultra 200Mbps Home Internet',
            isRecurring: true,
            recurringPeriod: 'MONTHLY'
        });

        // 5. Recurring Subscriptions (Streaming, Cloud, Unused Gym)
        transactionsToInsert.push({
            organizationId: org1.id,
            userId: user.id,
            amount: 250,
            type: 'EXPENSE',
            categoryId: categoryMap['Subscriptions & Services_EXPENSE'],
            merchant: 'Netflix Egypt',
            date: new Date(Date.UTC(y, mo, 8, 14, 0, 0)),
            paymentMethod: 'CARD',
            description: 'Standard 4K Plan Subscription',
            isRecurring: true,
            recurringPeriod: 'MONTHLY'
        });

        transactionsToInsert.push({
            organizationId: org1.id,
            userId: user.id,
            amount: 90,
            type: 'EXPENSE',
            categoryId: categoryMap['Subscriptions & Services_EXPENSE'],
            merchant: 'Spotify Premium',
            date: new Date(Date.UTC(y, mo, 10, 8, 0, 0)),
            paymentMethod: 'CARD',
            description: 'Music Streaming Subscription',
            isRecurring: true,
            recurringPeriod: 'MONTHLY'
        });

        // Subscriptions leak: Duplicated music streaming service!
        transactionsToInsert.push({
            organizationId: org1.id,
            userId: user.id,
            amount: 80,
            type: 'EXPENSE',
            categoryId: categoryMap['Subscriptions & Services_EXPENSE'],
            merchant: 'Anghami Plus',
            date: new Date(Date.UTC(y, mo, 12, 10, 0, 0)),
            paymentMethod: 'CARD',
            description: 'Arabic Music Subscription (Duplicated music service)',
            isRecurring: true,
            recurringPeriod: 'MONTHLY'
        });

        // Subscriptions leak: High gym membership unutilized
        transactionsToInsert.push({
            organizationId: org1.id,
            userId: user.id,
            amount: 1200,
            type: 'EXPENSE',
            categoryId: categoryMap['Healthcare & Fitness_EXPENSE'],
            merchant: "Gold's Gym Elite",
            date: new Date(Date.UTC(y, mo, 3, 10, 0, 0)),
            paymentMethod: 'CARD',
            description: 'Monthly Club Gym Access',
            isRecurring: true,
            recurringPeriod: 'MONTHLY'
        });

        // 6. Groceries & Supermarkets (4 weekly transactions per month)
        const groceryDays = [4, 11, 18, 25];
        const groceryMerchants = ['Carrefour Hypermarket', 'Metro Market', 'Seoudi Supermarket', 'Spinneys Egypt'];
        groceryDays.forEach((day, idx) => {
            transactionsToInsert.push({
                organizationId: org1.id,
                userId: user.id,
                amount: 1650 + (idx * 120) + (m * 50),
                type: 'EXPENSE',
                categoryId: categoryMap['Food & Groceries_EXPENSE'],
                merchant: groceryMerchants[idx],
                date: new Date(Date.UTC(y, mo, day, 18, 30, 0)),
                paymentMethod: 'CARD',
                description: 'Weekly household groceries and essentials'
            });
        });

        // 7. Transportation & Fuel (Uber, Total Energies Gas)
        const transitDays = [7, 15, 21, 28];
        transitDays.forEach((day, idx) => {
            transactionsToInsert.push({
                organizationId: org1.id,
                userId: user.id,
                amount: 380 + (idx * 45),
                type: 'EXPENSE',
                categoryId: categoryMap['Transportation_EXPENSE'],
                merchant: idx % 2 === 0 ? 'TotalEnergies Station' : 'Uber Egypt',
                date: new Date(Date.UTC(y, mo, day, 8, 45, 0)),
                paymentMethod: idx % 2 === 0 ? 'CASH' : 'CARD',
                description: idx % 2 === 0 ? 'Vehicle Fuel Refill' : 'Commute to Client Office'
            });
        });

        // 8. Food Delivery Orders (Intentional Detective Pattern: Normal in Months 0-3, Surge in Months 4-5)
        const isSurgeMonth = (m >= 4); // Months 5 and 6
        const deliveryCount = isSurgeMonth ? 17 : 8;
        const deliveryMerchants = ['Talabat Egypt', 'elmenus Delivery', 'McDonalds Egypt', 'TBS Bakery', 'KFC Egypt'];

        for (let d = 0; d < deliveryCount; d++) {
            const day = Math.min(28, 2 + Math.floor(d * (26 / deliveryCount)));
            const avgAmt = isSurgeMonth ? 295 : 220;
            const variation = (d % 3) * 35;

            transactionsToInsert.push({
                organizationId: org1.id,
                userId: user.id,
                amount: avgAmt + variation,
                type: 'EXPENSE',
                categoryId: categoryMap['Food Delivery_EXPENSE'],
                merchant: deliveryMerchants[d % deliveryMerchants.length],
                date: new Date(Date.UTC(y, mo, day, 20, 15, 0)),
                paymentMethod: 'CARD',
                description: isSurgeMonth ? 'Evening dinner delivery order' : 'Weekend delivery order'
            });
        }

        // 9. Shopping & Apparel (Intentional Detective Pattern: Normal in M0-4, Large Spike in M5)
        if (m === 5) {
            // Month 6: Large shopping burst! (8,450 EGP total)
            transactionsToInsert.push({
                organizationId: org1.id,
                userId: user.id,
                amount: 4200,
                type: 'EXPENSE',
                categoryId: categoryMap['Shopping & Apparel_EXPENSE'],
                merchant: 'Tradeline Stores (Apple Reseller)',
                date: new Date(Date.UTC(y, mo, 13, 16, 0, 0)),
                paymentMethod: 'CARD',
                description: 'AirPods Pro & Electronics Accessories'
            });
            transactionsToInsert.push({
                organizationId: org1.id,
                userId: user.id,
                amount: 2850,
                type: 'EXPENSE',
                categoryId: categoryMap['Shopping & Apparel_EXPENSE'],
                merchant: 'Zara Cairo Festival City',
                date: new Date(Date.UTC(y, mo, 19, 19, 30, 0)),
                paymentMethod: 'CARD',
                description: 'Seasonal wardrobe refresh'
            });
            transactionsToInsert.push({
                organizationId: org1.id,
                userId: user.id,
                amount: 1400,
                type: 'EXPENSE',
                categoryId: categoryMap['Shopping & Apparel_EXPENSE'],
                merchant: 'Amazon Egypt',
                date: new Date(Date.UTC(y, mo, 24, 11, 20, 0)),
                paymentMethod: 'CARD',
                description: 'Home Office Ergonomic Stand'
            });
        } else {
            // Normal shopping in months 0-4 (~2,000 EGP)
            transactionsToInsert.push({
                organizationId: org1.id,
                userId: user.id,
                amount: 1850 + (m * 80),
                type: 'EXPENSE',
                categoryId: categoryMap['Shopping & Apparel_EXPENSE'],
                merchant: 'Amazon Egypt',
                date: new Date(Date.UTC(y, mo, 16, 14, 0, 0)),
                paymentMethod: 'CARD',
                description: 'General online shopping'
            });
        }

        // 10. Entertainment & Leisure (Dining out, Cinema)
        transactionsToInsert.push({
            organizationId: org1.id,
            userId: user.id,
            amount: 850 + (m * 50),
            type: 'EXPENSE',
            categoryId: categoryMap['Entertainment & Leisure_EXPENSE'],
            merchant: 'Vox Cinemas & Mall of Egypt',
            date: new Date(Date.UTC(y, mo, 20, 21, 0, 0)),
            paymentMethod: 'CARD',
            description: 'Movie night with friends'
        });
    }

    // Insert all transactions in batch
    await prisma.transaction.createMany({
        data: transactionsToInsert
    });
    console.log(`✅ Seeded ${transactionsToInsert.length} realistic EGP transactions spanning 6 months.`);

    // ============================================================================
    // 8. SEED ACTIVE BUDGETS FOR CURRENT MONTH
    // ============================================================================
    console.log('\n🎯 Seeding category budgets for current month...');
    const currentMonthNum = baseMonth + 1;

    const budgetDefs = [
        { categoryKey: 'Food & Groceries_EXPENSE', amount: 8000, threshold: 0.8 },
        { categoryKey: 'Food Delivery_EXPENSE', amount: 2500, threshold: 0.8 }, // Will show over-budget!
        { categoryKey: 'Transportation_EXPENSE', amount: 2500, threshold: 0.8 },
        { categoryKey: 'Shopping & Apparel_EXPENSE', amount: 4000, threshold: 0.8 }, // Will show over-budget!
        { categoryKey: 'Bills & Utilities_EXPENSE', amount: 2500, threshold: 0.8 },
        { categoryKey: 'Entertainment & Leisure_EXPENSE', amount: 1500, threshold: 0.8 },
        { categoryKey: 'Subscriptions & Services_EXPENSE', amount: 600, threshold: 0.8 }
    ];

    for (const bDef of budgetDefs) {
        await prisma.budget.create({
            data: {
                organizationId: org1.id,
                userId: user.id,
                categoryId: categoryMap[bDef.categoryKey],
                amount: bDef.amount,
                month: currentMonthNum,
                year: baseYear,
                alertThreshold: bDef.threshold
            }
        });
    }
    console.log(`✅ Seeded ${budgetDefs.length} category budgets`);

    // ============================================================================
    // 9. SEED FINANCIAL SAVINGS GOALS
    // ============================================================================
    console.log('\n🏆 Seeding financial savings goals...');

    const goalDefs = [
        {
            title: 'Emergency Safety Reserve',
            targetAmount: 30000,
            currentAmount: 18500,
            targetDate: new Date(Date.UTC(baseYear, baseMonth + 6, 1)),
            category: 'Safety',
            icon: 'ShieldCheck'
        },
        {
            title: 'New M3 MacBook Pro Fund',
            targetAmount: 45000,
            currentAmount: 14000,
            targetDate: new Date(Date.UTC(baseYear, baseMonth + 8, 1)),
            category: 'Tech & Career',
            icon: 'Laptop'
        },
        {
            title: 'Red Sea Holiday Vacation',
            targetAmount: 18000,
            currentAmount: 12500,
            targetDate: new Date(Date.UTC(baseYear, baseMonth + 3, 15)),
            category: 'Travel',
            icon: 'Palmtree'
        }
    ];

    for (const gDef of goalDefs) {
        await prisma.financialGoal.create({
            data: {
                organizationId: org1.id,
                userId: user.id,
                title: gDef.title,
                targetAmount: gDef.targetAmount,
                currentAmount: gDef.currentAmount,
                targetDate: gDef.targetDate,
                category: gDef.category,
                icon: gDef.icon,
                status: 'ACTIVE'
            }
        });
    }
    console.log(`✅ Seeded ${goalDefs.length} active financial savings goals`);

    console.log('\n======================================================');
    console.log('🎉 Phase 1 Foundation Database Seed Completed!');
    console.log('======================================================');
    console.log('📝 Demo Credentials:');
    console.log('   Email:    user@acme.com');
    console.log('   Password: user123');
    console.log('   Currency: EGP (Egyptian Pound)');
    console.log('   Transactions: ~150 realistic entries over 6 months');
    console.log('======================================================\n');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
