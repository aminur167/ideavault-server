require('dotenv').config();
const mongoose = require('mongoose');
const connectDatabase = require('./db');
const Idea = require('./models/Idea');

const author = {
  authorId: 'ideavault-editorial',
  authorName: 'IdeaVault Editorial',
  authorEmail: 'editorial@ideavault.app',
  authorPhoto: '',
};

const ideas = [
  ['SolarShare: Neighbourhood Energy Exchange', 'Environment', 'A local marketplace for neighbours to trade unused solar energy.', 'Connect smart-meter data with fair, transparent local energy exchanges so homes can sell surplus power to nearby households.', 'Urban homeowners, apartment communities, and sustainability groups.', 'Solar power is wasted while nearby families still buy expensive grid electricity.', 'Create a verified local marketplace with transparent rates and community rewards.', '$35,000', ['solar', 'energy', 'community'], 14, 'photo-1508514177221-188b1cf16e9d'],
  ['MediRoute: Medicine Access Made Simple', 'Health', 'Find essential medicines at verified pharmacies and arrange reliable delivery.', 'MediRoute shows local medicine availability, lets patients reserve stock, and coordinates pickup or delivery through trusted pharmacies.', 'Patients, caregivers, and independent pharmacies.', 'Patients waste time visiting multiple pharmacies to find urgent prescriptions.', 'Aggregate pharmacy inventory and enable reservations with trusted last-mile delivery.', '$28,000', ['healthcare', 'pharmacy', 'delivery'], 12, 'photo-1584982751601-97dcc096659c'],
  ['SkillSprint: Micro Mentorship for Career Growth', 'Education', 'Focused twenty-minute sessions with professionals for immediate career guidance.', 'SkillSprint matches learners to verified mentors for concise, affordable conversations about portfolios, interviews, and career direction.', 'Students, career switchers, and junior professionals.', 'Long-term mentorship is hard to access when learners need timely guidance.', 'Offer topic-based micro sessions and an action plan after every conversation.', '$18,000', ['mentorship', 'career', 'learning'], 9, 'photo-1523240795612-9a054b0db644'],
  ['HarvestLink: Smart Market Access for Farmers', 'Food', 'Demand-led produce sales that reduce waste and improve farmer income.', 'HarvestLink enables restaurants and households to pre-order seasonal produce directly from verified farmers, with demand forecasts before harvest.', 'Small farmers, restaurants, grocery buyers, and food cooperatives.', 'Farmers face uncertainty and waste while buyers struggle to source reliable fresh produce.', 'Combine pre-orders, demand forecasting, and coordinated delivery routes.', '$42,000', ['agritech', 'farmers', 'supply-chain'], 11, 'photo-1464226184884-fa280b87c399'],
  ['SafeSteps: Personal Safety Companion', 'Tech', 'Privacy-first commute check-ins and trusted-contact safety alerts.', 'SafeSteps gives people quick route check-ins and encrypted sharing with selected contacts without turning location data into advertising.', 'Students, commuters, families, and campuses.', 'People feel unsafe travelling alone but existing tools can be intrusive or difficult to use.', 'Design calm, one-tap safety workflows with a private trusted circle.', '$24,000', ['safety', 'mobile', 'community'], 8, 'photo-1516321318423-f06f85e504b3'],
  ['FocusFlow AI: Study Plans That Adapt', 'AI', 'An AI planner that adjusts study tasks to deadlines and real progress.', 'FocusFlow translates subjects, deadlines, and available hours into flexible daily tasks, then recalibrates when a learner falls behind.', 'School students, university learners, and exam candidates.', 'Static timetables become overwhelming when priorities change.', 'Generate adaptable study plans with plain-language recommendations and privacy-conscious progress tracking.', '$30,000', ['ai', 'productivity', 'students'], 16, 'photo-1516321165247-4aa89a48be28'],
  ['TransitCircle: Shared Commutes for Teams', 'Travel', 'A secure workplace carpool network that lowers costs and emissions.', 'TransitCircle helps verified colleagues find compatible carpool partners using schedules and routes, with fair expense sharing.', 'Companies, business parks, and commuting employees.', 'Solo commuting is costly and congested, but people lack a trusted matching network.', 'Use organisation verification, route-aware matching, and employer sustainability reporting.', '$22,000', ['mobility', 'carpool', 'workplace'], 6, 'photo-1519003300449-424ad0405076'],
  ['LedgerLens: Cashflow Clarity for Small Shops', 'Finance', 'Simple financial insights for owners who do not speak accounting jargon.', 'LedgerLens turns daily sales and expenses into easy cashflow summaries, high-cost alerts, and useful next steps for small businesses.', 'Small retail shops, freelancers, and new entrepreneurs.', 'Business owners make decisions without a clear picture of profit or upcoming cash gaps.', 'Provide mobile-friendly tracking and plain-language weekly financial summaries.', '$26,000', ['fintech', 'small-business', 'analytics'], 10, 'photo-1554224155-6726b3ff858f'],
  ['RepairLoop: Give Electronics a Second Life', 'Environment', 'Find trusted repair experts before a device becomes electronic waste.', 'RepairLoop offers repair estimates, technician profiles, spare-part discovery, and repair-versus-replace impact summaries.', 'Device owners, repair shops, and eco-conscious communities.', 'Repair is harder to discover and compare than replacing a device.', 'Create a transparent repair network with trusted local technicians.', '$20,000', ['repair', 'circular-economy', 'electronics'], 7, 'photo-1581092160607-ee22621dd758'],
  ['StoryBridge: Local Culture Through Audio Walks', 'Entertainment', 'Location-aware audio stories created by local historians and artists.', 'StoryBridge turns city walks into rich cultural experiences with short audio stories, community routes, and creator revenue sharing.', 'Travellers, students, cultural organisations, and local storytellers.', 'Visitors miss local stories while creators lack easy ways to share their knowledge.', 'Offer map-based audio walks, accessible offline listening, and creator tools.', '$16,000', ['culture', 'audio', 'tourism'], 5, 'photo-1521295121783-8a321d551ad2'],
];

async function seed() {
  await connectDatabase();
  const titles = ideas.map(([title]) => title);
  const existing = await Idea.find({ title: { $in: titles } }).distinct('title');
  const newIdeas = ideas
    .filter(([title]) => !existing.includes(title))
    .map(([title, category, shortDescription, detailedDescription, targetAudience, problemStatement, proposedSolution, estimatedBudget, tags, commentCount, photo], index) => ({
      ...author, title, category, shortDescription, detailedDescription, targetAudience, problemStatement, proposedSolution,
      estimatedBudget, tags, commentCount,
      imageURL: `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=1200&q=82`,
      createdAt: new Date(Date.now() - (ideas.length - index) * 86400000),
    }));
  if (newIdeas.length) await Idea.insertMany(newIdeas);
  console.log(`Demo ideas ready: ${existing.length} existed, ${newIdeas.length} added.`);
}

seed()
  .catch((error) => { console.error('Could not seed demo ideas:', error.message); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());
