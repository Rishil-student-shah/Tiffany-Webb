const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/pages/index.astro', 'utf8');

const regexMap = {
    '<Hero content={dbContent.hero || {}} />': '{(!dbContent.hero || dbContent.hero.section_is_active !== "0") && <Hero content={dbContent.hero || {}} />}',
    '<ImpactBand collections={dbCollections} />': '{(!dbContent.impact_band || dbContent.impact_band.section_is_active !== "0") && <ImpactBand collections={dbCollections} />}',
    '<CredibilityBar collections={dbCollections} />': '{(!dbContent.credibility_bar || dbContent.credibility_bar.section_is_active !== "0") && <CredibilityBar collections={dbCollections} />}',
    '<MeetTiffany content={dbContent.meet_tiffany || {}} collections={dbCollections} />': '{(!dbContent.meet_tiffany || dbContent.meet_tiffany.section_is_active !== "0") && <MeetTiffany content={dbContent.meet_tiffany || {}} collections={dbCollections} />}',
    '<Expertise content={dbContent.expertise || {}} collections={dbCollections} />': '{(!dbContent.expertise || dbContent.expertise.section_is_active !== "0") && <Expertise content={dbContent.expertise || {}} collections={dbCollections} />}',
    '<WhereSheWorks content={dbContent.who_can_benefit || {}} collections={dbCollections} />': '{(!dbContent.who_can_benefit || dbContent.who_can_benefit.section_is_active !== "0") && <WhereSheWorks content={dbContent.who_can_benefit || {}} collections={dbCollections} />}',
    '<MediaBand content={dbContent.media || {}} />': '{(!dbContent.media || dbContent.media.section_is_active !== "0") && <MediaBand content={dbContent.media || {}} />}',
    '<EventsImpact content={dbContent.events || {}} collections={dbCollections} />': '{(!dbContent.events || dbContent.events.section_is_active !== "0") && <EventsImpact content={dbContent.events || {}} collections={dbCollections} />}',
    '<Proof content={dbContent.proof || {}} collections={dbCollections} />': '{(!dbContent.proof || dbContent.proof.section_is_active !== "0") && <Proof content={dbContent.proof || {}} collections={dbCollections} />}',
    '<BookingSection content={dbContent.booking || {}} />': '{(!dbContent.booking || dbContent.booking.section_is_active !== "0") && <BookingSection content={dbContent.booking || {}} />}'
};

for (const [oldStr, newStr] of Object.entries(regexMap)) {
    content = content.replace(oldStr, newStr);
}

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/pages/index.astro', content, 'utf8');
