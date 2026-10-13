import { GameRound } from '../types/game';

export interface CategoryInfo {
  id: string;
  name: string;
  group: string;
  icon: string;
  color: string;
  description: string;
}

export const CATEGORY_GROUPS = [
  'Everyday Life & Minor Chaos',
  'Food & Taste',
  'Friends & Social Behavior',
  'Hypothetical Scenarios',
  'Living & Survival',
  'Technology & Modern Life',
  'Imagination & Absurdity',
  'Work & Responsibilities',
  'Chaos & Special Categories',
];

export const ALL_CATEGORIES: CategoryInfo[] = [
  // Everyday life & minor chaos
  { id: 'c1', name: 'Everyday Food Crimes', group: 'Food & Taste', icon: '🥫', color: '#FF6B6B', description: 'Culinary atrocities committed behind closed kitchen doors.' },
  { id: 'c2', name: 'Minor Social Crimes', group: 'Everyday Life & Minor Chaos', icon: '👀', color: '#4ECDC4', description: 'Behaviors that should not land you in prison, but certainly on a watchlist.' },
  { id: 'c3', name: 'Mild Inconveniences', group: 'Everyday Life & Minor Chaos', icon: '😤', color: '#FFE66D', description: 'Small universe glitches designed specifically to ruin your morning.' },
  { id: 'c4', name: 'Awkward Public Moments', group: 'Everyday Life & Minor Chaos', icon: '😳', color: '#FF8ED4', description: 'That moment you wave back to a stranger who was waving at someone else.' },
  { id: 'c5', name: 'Annoying Human Habits', group: 'Everyday Life & Minor Chaos', icon: '🤨', color: '#A8DADC', description: 'Things people do in elevators, queues, and public transport.' },
  { id: 'c6', name: 'Petty Things That Make You Angry', group: 'Everyday Life & Minor Chaos', icon: '🤬', color: '#E63946', description: 'Irrationally furious reactions to microscopic problems.' },
  { id: 'c7', name: 'Unnecessary Daily Struggles', group: 'Everyday Life & Minor Chaos', icon: '🫠', color: '#F4A261', description: 'Opening blister packaging with your teeth and other avoidable misery.' },
  { id: 'c8', name: 'Things That Should Be Illegal', group: 'Everyday Life & Minor Chaos', icon: '🚨', color: '#E76F51', description: 'Legally permitted actions that cause immense moral damage.' },
  { id: 'c9', name: 'Suspiciously Specific Problems', group: 'Everyday Life & Minor Chaos', icon: '🧐', color: '#2A9D8F', description: 'Oddly intricate scenarios you hope never happen to you.' },
  { id: 'c10', name: 'Small Things That Ruin Your Day', group: 'Everyday Life & Minor Chaos', icon: '🌧️', color: '#457B9D', description: 'Stepping in a puddle with fresh socks and beyond.' },

  // Food and taste
  { id: 'c11', name: 'Unholy Food Combinations', group: 'Food & Taste', icon: '🤢', color: '#9B5DE5', description: 'Flavors that should remain in separate geographical hemispheres.' },
  { id: 'c12', name: 'Breakfast Controversies', group: 'Food & Taste', icon: '🥞', color: '#F15BB5', description: 'Cold coffee vs orange juice after toothpaste.' },
  { id: 'c13', name: 'Questionable Snack Choices', group: 'Food & Taste', icon: '🍿', color: '#FEE440', description: 'Late-night concoctions constructed in darkness.' },
  { id: 'c14', name: 'Fast-Food Decisions', group: 'Food & Taste', icon: '🍟', color: '#00BBF9', description: 'Drive-through remorse and dipping sauce politics.' },
  { id: 'c15', name: 'Kitchen Crimes', group: 'Food & Taste', icon: '🍳', color: '#00F5D4', description: 'Cutting steak with butter knives and washing mushrooms with soap.' },
  { id: 'c16', name: 'Dessert Dilemmas', group: 'Food & Taste', icon: '🍰', color: '#FF99C8', description: 'Raisins disguised as chocolate chips and other deceit.' },
  { id: 'c17', name: 'Strange Restaurant Behaviour', group: 'Food & Taste', icon: '🍽️', color: '#FCF6BD', description: 'Asking for tap water in an empty wine glass to look sophisticated.' },
  { id: 'c18', name: 'Drinks That Should Not Exist', group: 'Food & Taste', icon: '🥤', color: '#D0F4DE', description: 'Warm fizzy milk and sparkling vinegar.' },

  // Friends and social behaviour
  { id: 'c19', name: 'Group Chat Disasters', group: 'Friends & Social Behavior', icon: '💬', color: '#A9DEF9', description: 'The fatal wrong screenshot sent to the exact person it mocks.' },
  { id: 'c20', name: 'Terrible Texting Habits', group: 'Friends & Social Behavior', icon: '📱', color: '#E4C1F9', description: 'Replying with just "k" after a 500-word emotional paragraph.' },
  { id: 'c21', name: 'Awkward First Impressions', group: 'Friends & Social Behavior', icon: '🤝', color: '#FFBE0B', description: 'Going for a high-five while they go for a hug.' },
  { id: 'c22', name: 'Friendship Red Flags', group: 'Friends & Social Behavior', icon: '🚩', color: '#FB5607', description: 'Borrowing a pen and immediately chewing the cap.' },
  { id: 'c23', name: 'Questionable Party Behaviour', group: 'Friends & Social Behavior', icon: '🎉', color: '#FF006E', description: 'Hijacking the aux cable to play 18-minute atmospheric black metal.' },
  { id: 'c24', name: 'Unbearable Roommates', group: 'Friends & Social Behavior', icon: '🚪', color: '#8338EC', description: 'Leaving one molecule of cereal so they don’t have to throw away the box.' },
  { id: 'c25', name: 'Awkward Family Gatherings', group: 'Friends & Social Behavior', icon: '🦃', color: '#3A86FF', description: 'Unsolicited career advice from relatives you see once a decade.' },
  { id: 'c26', name: 'Dating Disasters', group: 'Friends & Social Behavior', icon: '💔', color: '#F72585', description: 'Splitting a £4 milkshake into two separate invoices.' },
  { id: 'c27', name: 'Socially Unacceptable Superpowers', group: 'Friends & Social Behavior', icon: '🦹', color: '#7209B7', description: 'X-ray hearing, but only for people whispering about your hair.' },
  { id: 'c28', name: 'Ways to Ruin a Conversation', group: 'Friends & Social Behavior', icon: '🤐', color: '#3F37C9', description: 'Saying "actually..." within four seconds of someone sharing a dream.' },

  // Hypothetical scenarios
  { id: 'c29', name: 'Bizarre Superpowers with Bad Side Effects', group: 'Hypothetical Scenarios', icon: '⚡', color: '#4CC9F0', description: 'Flight, but only at walking speed and 2 inches above gravel.' },
  { id: 'c30', name: 'Cursed Wishes', group: 'Hypothetical Scenarios', icon: '🧞', color: '#4895EF', description: 'Unlimited wealth, but it only arrives in unrolled copper pennies.' },
  { id: 'c31', name: 'Terrible Superhero Abilities', group: 'Hypothetical Scenarios', icon: '🦸', color: '#560BAD', description: 'The ability to summon lukewarm damp towels on command.' },
  { id: 'c32', name: 'Useless Inventions', group: 'Hypothetical Scenarios', icon: '💡', color: '#B5179E', description: 'Solar-powered flashlights and waterproof tea bags.' },
  { id: 'c33', name: 'Absurd Laws of Physics', group: 'Hypothetical Scenarios', icon: '🪐', color: '#F72585', description: 'If gravity took a 5-minute coffee break every Tuesday.' },
  { id: 'c34', name: 'Weird Alternate Universes', group: 'Hypothetical Scenarios', icon: '🌌', color: '#3A0CA3', description: 'Where shoes wear humans and books read faces.' },
  { id: 'c35', name: 'Unfortunate Time-Travel Decisions', group: 'Hypothetical Scenarios', icon: '⏳', color: '#4361EE', description: 'Travelling back to 1347 just to show someone a fidget spinner.' },
  { id: 'c36', name: 'Ridiculous Life Upgrades', group: 'Hypothetical Scenarios', icon: '✨', color: '#4CC9F0', description: 'Having background boss music whenever you enter a bank.' },
  { id: 'c37', name: 'Jobs Nobody Should Have', group: 'Hypothetical Scenarios', icon: '💼', color: '#48CAE4', description: 'Professional bubble wrap deflator.' },
  { id: 'c38', name: 'Horrible Things to Be Famous For', group: 'Hypothetical Scenarios', icon: '🏆', color: '#90E0EF', description: 'The guy who accidentally locked himself in a bouncy castle for 4 days.' },

  // Living and survival
  { id: 'c39', name: 'Bizarre Living Situations', group: 'Living & Survival', icon: '🏠', color: '#ADE8F4', description: 'A flat with a shower in the center of the kitchen.' },
  { id: 'c40', name: 'Rental Nightmares', group: 'Living & Survival', icon: '🐀', color: '#CAF0F8', description: 'Landlord paints over a live spider on the living room wall.' },
  { id: 'c41', name: 'Terrible Holiday Experiences', group: 'Living & Survival', icon: '🏖️', color: '#FFD166', description: 'Seaside view that turns out to be a poster of the seaside.' },
  { id: 'c42', name: 'Worst Possible Travel Companions', group: 'Living & Survival', icon: '🧳', color: '#06D6A0', description: 'The person who claps when the plane touches tarmac.' },
  { id: 'c43', name: 'Unfortunate Ways to Spend a Weekend', group: 'Living & Survival', icon: '🛋️', color: '#118AB2', description: 'Assembling flat-pack furniture with a missing hex key.' },
  { id: 'c44', name: 'Survival Situations That Should Be Easy', group: 'Living & Survival', icon: '🏕️', color: '#073B4C', description: 'Opening a jar of pickled onions when your hands are slightly buttery.' },
  { id: 'c45', name: 'Animals with Human Jobs', group: 'Living & Survival', icon: '🦝', color: '#E76F51', description: 'A raccoon conducting an airport security pat-down.' },
  { id: 'c46', name: 'Things That Would Be Awful If They Could Talk', group: 'Living & Survival', icon: '🗣️', color: '#F4A261', description: 'Your bathroom scales and your bedroom mirror.' },

  // Technology and modern life
  { id: 'c47', name: 'Technology Gone Wrong', group: 'Technology & Modern Life', icon: '💻', color: '#E9C46A', description: 'Autocorrect replacing "Best regards" with "Best retard".' },
  { id: 'c48', name: 'Unnecessary Phone Features', group: 'Technology & Modern Life', icon: '📲', color: '#2A9D8F', description: 'Vibrating every time your battery drops by exactly 1%.' },
  { id: 'c49', name: 'AI Assistants from Hell', group: 'Technology & Modern Life', icon: '🤖', color: '#264653', description: 'An assistant that loudly announces your search history to guests.' },
  { id: 'c50', name: 'The Worst Possible App Ideas', group: 'Technology & Modern Life', icon: '💾', color: '#D62828', description: 'An app that texts your ex whenever you drink caffeine after 9 PM.' },
  { id: 'c51', name: 'Terrible Ways to Use the Internet', group: 'Technology & Modern Life', icon: '🌐', color: '#F77F00', description: 'Commenting "first" on an obituary post.' },
  { id: 'c52', name: 'Gaming Rage Moments', group: 'Technology & Modern Life', icon: '🎮', color: '#FCBF49', description: 'Controller dying right during the final boss victory cutscene.' },
  { id: 'c53', name: 'Ridiculous Smart Home Features', group: 'Technology & Modern Life', icon: '💡', color: '#EAE2B7', description: 'Smart fridge that locks itself when it judges your BMI.' },
  { id: 'c54', name: 'Things Your Phone Should Never Say', group: 'Technology & Modern Life', icon: '📳', color: '#6A0572', description: '"Warning: 3 unidentified observers detected behind you."' },

  // Imagination and absurdity
  { id: 'c55', name: 'Objects with Personalities', group: 'Imagination & Absurdity', icon: '🧸', color: '#AB83A1', description: 'A toaster that sighs dramatically every time you push the lever.' },
  { id: 'c56', name: 'Villain Origin Stories', group: 'Imagination & Absurdity', icon: '🦹‍♂️', color: '#E71D36', description: 'Someone taking the last warm croissant at a hotel buffet.' },
  { id: 'c57', name: 'Terrible Business Ideas', group: 'Imagination & Absurdity', icon: '📈', color: '#2EC4B6', description: 'Subscription-based socks where you only receive the left one.' },
  { id: 'c58', name: 'Worst Possible Mascots', group: 'Imagination & Absurdity', icon: '🤡', color: '#FF9F1C', description: 'A sweaty turnip advertising dental floss.' },
  { id: 'c59', name: 'Things That Are Suspiciously Powerful', group: 'Imagination & Absurdity', icon: '🪄', color: '#011627', description: 'A little wooden cocktail stick holding a mega sandwich together.' },
  { id: 'c60', name: 'Unhinged Marketing Campaigns', group: 'Imagination & Absurdity', icon: '📢', color: '#9D4EDD', description: 'A funeral home offering a "Buy One, Get One Half Off" spring deal.' },

  // Work, school, and responsibilities
  { id: 'c71', name: 'Workplace Nonsense', group: 'Work & Responsibilities', icon: '📎', color: '#3A86FF', description: 'Reply-All email threads that escalate into international conflict.' },
  { id: 'c72', name: 'School Memories and Disasters', group: 'Work & Responsibilities', icon: '🎒', color: '#8338EC', description: 'Calling the teacher "Mum" in front of the entire assembly.' },
  { id: 'c73', name: 'Terrible Boss Behaviour', group: 'Work & Responsibilities', icon: '👔', color: '#FF006E', description: 'Scheduling a 4:55 PM Friday meeting titled "Quick chat".' },
  { id: 'c74', name: 'Worst Group Project Partners', group: 'Work & Responsibilities', icon: '👥', color: '#FB5607', description: 'Takes all credit, contributed only to the font selection.' },
  { id: 'c79', name: 'Meetings That Should Never Exist', group: 'Work & Responsibilities', icon: '☕', color: '#FFBE0B', description: 'A 45-minute sync to discuss scheduling the subsequent sync.' },

  // Chaos and special categories
  { id: 'c81', name: 'The Ultimate Petty Debate', group: 'Chaos & Special Categories', icon: '⚖️', color: '#FF5964', description: 'Is a hotdog a taco, a sandwich, or an insult to sausage?' },
  { id: 'c82', name: 'Mildly Evil Master Plans', group: 'Chaos & Special Categories', icon: '😈', color: '#35A7FF', description: 'Slightly adjusting everyone’s office chair height by 1 centimeter.' },
  { id: 'c87', name: 'Things That Feel Illegal but Aren’t', group: 'Chaos & Special Categories', icon: '👮', color: '#386641', description: 'Walking out of a shop without buying anything with both hands in pockets.' },
  { id: 'c90', name: 'The Final Brain Cell', group: 'Chaos & Special Categories', icon: '🧠', color: '#6A994E', description: 'Moments where common sense simply packs its bags and leaves.' },
];

export const CURATED_ROUNDS: GameRound[] = [
  {
    category: 'Everyday Food Crimes',
    prompt: 'Rank these culinary habits from completely acceptable to an absolute culinary crime.',
    scale_labels: {
      rank_1: '1. Completely Fine',
      rank_4: '4. Absolute Food Crime',
    },
    items: [
      {
        id: 'A',
        title: 'Orange Juice Cereal',
        description: 'Pouring ice-cold pulpy orange juice into cornflakes instead of milk.',
        icon_suggestion: '🍊',
      },
      {
        id: 'B',
        title: 'Pizza Scissors',
        description: 'Using standard stationery scissors to cut a hot margherita pizza into strips.',
        icon_suggestion: '✂️',
      },
      {
        id: 'C',
        title: 'Warm Wine Ice',
        description: 'Dropping tap-water ice cubes into a vintage red wine to chill it quickly.',
        icon_suggestion: '🍷',
      },
      {
        id: 'D',
        title: 'Milkshake Fries',
        description: 'Dipping hot, salty fast-food fries into a thick chocolate milkshake.',
        icon_suggestion: '🍟',
      },
    ],
    host_commentary: 'Humanity invented the telescope and the internet, yet here we are debating juice in cereal.',
  },
  {
    category: 'Minor Social Crimes',
    prompt: 'Rank these social offenses from harmless slip-up to immediate friendship review.',
    scale_labels: {
      rank_1: '1. Innocent Mistake',
      rank_4: '4. Friendship Review',
    },
    items: [
      {
        id: 'A',
        title: 'Leaving One Crisp',
        description: 'Leaving exactly one crushed Dorito at the bottom of the bag so you do not have to throw it away.',
        icon_suggestion: '🥔',
      },
      {
        id: 'B',
        title: 'Spoiling a 10-Year-Old Film',
        description: 'Casually revealing the ending of a decade-old movie without checking if your friend has seen it.',
        icon_suggestion: '🎬',
      },
      {
        id: 'C',
        title: 'Speakerphone on Bus',
        description: 'Conducting a private, loud argument on speakerphone in a crowded morning commuter bus.',
        icon_suggestion: '📢',
      },
      {
        id: 'D',
        title: 'Ghosting Mid-Text',
        description: 'Asking "Are you free in 10 minutes?" and then vanishing into thin air for 3 days.',
        icon_suggestion: '👻',
      },
    ],
    host_commentary: 'Some crimes belong in court. These ones belong in group-chat exile.',
  },
  {
    category: 'The Ultimate Petty Debate',
    prompt: 'Rank these controversial household stances from undeniably correct to grounds for divorce.',
    scale_labels: {
      rank_1: '1. Pure Logic',
      rank_4: '4. Chaos Incarnate',
    },
    items: [
      {
        id: 'A',
        title: 'Toilet Paper Underhand',
        description: 'Hanging the toilet paper roll so the sheet dispenses against the cold bathroom tiles.',
        icon_suggestion: '🧻',
      },
      {
        id: 'B',
        title: 'Pineapple on Pizza',
        description: 'Warm chunks of acidic pineapple baked onto mozzarella cheese and tomato sauce.',
        icon_suggestion: '🍍',
      },
      {
        id: 'C',
        title: 'Bed Socks in Summer',
        description: 'Wearing thick fuzzy woolen socks to sleep underneath a summer duvet in July.',
        icon_suggestion: '🧦',
      },
      {
        id: 'D',
        title: 'Washing Dishes Without Soap',
        description: 'Rinsing oily plates under boiling water and claiming "hot water kills everything".',
        icon_suggestion: '🧼',
      },
    ],
    host_commentary: 'If your friends cannot agree on toilet paper orientation, society has truly collapsed.',
  },
  {
    category: 'Bizarre Superpowers with Bad Side Effects',
    prompt: 'Rank these cursed superpowers from genuinely useful to a living nightmare.',
    scale_labels: {
      rank_1: '1. I would take this',
      rank_4: '4. Keep it away from me',
    },
    items: [
      {
        id: 'A',
        title: 'Telepathy (Audible Ads)',
        description: 'You can read anyone’s thoughts, but an unskippable 30-second commercial plays in your ears first.',
        icon_suggestion: '🧠',
      },
      {
        id: 'B',
        title: 'Flight at Walking Pace',
        description: 'You can fly, but only at 3 miles per hour, exactly 2 inches above the ground.',
        icon_suggestion: '🕊️',
      },
      {
        id: 'C',
        title: 'Invisibility When Sneezing',
        description: 'You are completely invisible, but only for the 1.5 seconds while actively mid-sneeze.',
        icon_suggestion: '🤧',
      },
      {
        id: 'D',
        title: 'Instant Wardrobe Swapping',
        description: 'You can teleport into any outfit, but your socks are permanently 10% damp.',
        icon_suggestion: '👔',
      },
    ],
    host_commentary: 'With great power comes extraordinarily annoying administrative drawbacks.',
  },
  {
    category: 'Workplace Nonsense',
    prompt: 'Rank these corporate horrors from mild eye-roll to updating your resume right now.',
    scale_labels: {
      rank_1: '1. Bearable',
      rank_4: '4. Immediate Resignation',
    },
    items: [
      {
        id: 'A',
        title: 'Mandatory Fun Social',
        description: 'An unpaid Tuesday evening virtual trivia night where the CEO plays the acoustic ukulele.',
        icon_suggestion: '🎸',
      },
      {
        id: 'B',
        title: 'The "Per My Last Email"',
        description: 'A coworker copying your boss while passive-aggressively pasting sentences you wrote yesterday.',
        icon_suggestion: '📧',
      },
      {
        id: 'C',
        title: '4:59 PM Friday Call',
        description: 'A calendar invite titled "Quick alignment" dropped onto your screen 60 seconds before weekend.',
        icon_suggestion: '⏰',
      },
      {
        id: 'D',
        title: 'Microwaved Tuna',
        description: 'A colleague heating an entire tin of mackerel in the shared unventilated breakroom microwave.',
        icon_suggestion: '🐟',
      },
    ],
    host_commentary: 'Office politics: the ancient gladiatorial arena for people wearing lanyards.',
  },
];
