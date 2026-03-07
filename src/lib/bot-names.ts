// ============================================================================
// Culturally diverse bot name database
// 200+ first names from 40+ countries/cultures
// ============================================================================

export const BOT_FIRST_NAMES: string[] = [
  // Arabic
  'Omar', 'Fatima', 'Youssef', 'Layla', 'Ahmed', 'Amira', 'Hassan', 'Nadia',
  'Khalid', 'Salma', 'Tariq', 'Rania', 'Samir', 'Hana', 'Karim', 'Dina',

  // Chinese
  'Wei', 'Mei', 'Jian', 'Xiao', 'Hao', 'Ling', 'Chen', 'Yan', 'Ming', 'Hui',
  'Zhi', 'Fang', 'Tao', 'Qian', 'Jun', 'Yue',

  // Japanese
  'Yuki', 'Hiro', 'Sakura', 'Kenji', 'Aiko', 'Takeshi', 'Mio', 'Ryu',
  'Haruka', 'Daichi', 'Emi', 'Naoto', 'Sora', 'Kenta', 'Yui', 'Akira',

  // Korean
  'Jimin', 'Seo-yeon', 'Hyun', 'Min-ji', 'Tae', 'Ji-woo', 'Sung', 'Ha-na',
  'Dae', 'Yeon', 'Jun-ho', 'Eun', 'Woo-jin', 'Soo', 'Hye', 'Dong',

  // Indian
  'Priya', 'Arjun', 'Ananya', 'Rohan', 'Kavya', 'Vikram', 'Neha', 'Aditya',
  'Shreya', 'Raj', 'Diya', 'Sanjay', 'Pooja', 'Kiran', 'Aarav', 'Meera',

  // Hispanic / Latin American
  'Sofia', 'Diego', 'Valentina', 'Carlos', 'Isabella', 'Mateo', 'Camila', 'Andres',
  'Lucia', 'Santiago', 'Elena', 'Rafael', 'Mariana', 'Jorge', 'Paula', 'Luis',

  // Brazilian
  'Thiago', 'Beatriz', 'Lucas', 'Gabriela', 'Pedro', 'Larissa', 'Rafael', 'Juliana',
  'Bruno', 'Amanda', 'Vinicius', 'Fernanda', 'Caio', 'Bianca', 'Gustavo', 'Leticia',

  // French
  'Pierre', 'Claire', 'Antoine', 'Eloise', 'Hugo', 'Manon', 'Louis', 'Chloe',
  'Theo', 'Camille', 'Remi', 'Lea', 'Julien', 'Margot', 'Adrien', 'Ines',

  // German
  'Felix', 'Lena', 'Lukas', 'Mia', 'Jonas', 'Emma', 'Leon', 'Hannah',
  'Finn', 'Nora', 'Moritz', 'Lina', 'Erik', 'Klara', 'Maximilian', 'Greta',

  // Italian
  'Marco', 'Giulia', 'Luca', 'Chiara', 'Matteo', 'Francesca', 'Andrea', 'Elisa',
  'Tommaso', 'Sara', 'Davide', 'Martina', 'Filippo', 'Alessia', 'Riccardo', 'Aurora',

  // Nigerian
  'Chidi', 'Ngozi', 'Emeka', 'Adaeze', 'Obinna', 'Nneka', 'Ikenna', 'Amaka',
  'Oluwaseun', 'Chiamaka', 'Tunde', 'Yetunde', 'Femi', 'Bukola', 'Segun', 'Funke',

  // Kenyan / East African
  'Wanjiku', 'Kamau', 'Akinyi', 'Odhiambo', 'Njeri', 'Kipchoge', 'Amani', 'Baraka',
  'Imani', 'Jelani', 'Zuri', 'Tendai', 'Makena', 'Jabari', 'Nia', 'Kofi',

  // Russian / Eastern European
  'Dmitri', 'Anya', 'Alexei', 'Katya', 'Nikolai', 'Olga', 'Ivan', 'Natasha',
  'Maxim', 'Daria', 'Pavel', 'Vera', 'Sergei', 'Irina', 'Andrei', 'Mila',

  // Turkish
  'Emre', 'Elif', 'Can', 'Zeynep', 'Cem', 'Defne', 'Berk', 'Selin',
  'Deniz', 'Yasemin', 'Ali', 'Aylin', 'Mert', 'Esra', 'Burak', 'Nazli',

  // Nordic
  'Erik', 'Astrid', 'Lars', 'Ingrid', 'Oskar', 'Freya', 'Magnus', 'Sigrid',
  'Sven', 'Elsa', 'Bjorn', 'Ida', 'Axel', 'Saga', 'Nils', 'Maja',

  // Persian
  'Darius', 'Shirin', 'Cyrus', 'Parisa', 'Reza', 'Maryam', 'Arash', 'Yasmin',
  'Navid', 'Leila', 'Omid', 'Sara', 'Kian', 'Azadeh', 'Farhad', 'Nasrin',

  // Thai / Southeast Asian
  'Somchai', 'Nari', 'Tanawat', 'Ploy', 'Chai', 'Siri', 'Niran', 'Mali',
  'Anurak', 'Dao', 'Bao', 'Linh', 'Minh', 'Tam', 'Ariya', 'Kanya',

  // Filipino
  'Miguel', 'Maria', 'Carlo', 'Angel', 'Rafael', 'Jana', 'Rico', 'Lea',

  // Polish
  'Jakub', 'Zofia', 'Kacper', 'Maja', 'Piotr', 'Wanda', 'Tomek', 'Ola',

  // Dutch
  'Daan', 'Sanne', 'Bram', 'Lotte', 'Stijn', 'Fleur', 'Ruben', 'Femke',

  // Pakistani / Bangladeshi
  'Zain', 'Ayesha', 'Hamza', 'Saba', 'Usman', 'Mahira', 'Bilal', 'Noor',
];

export const BOT_LAST_INITIALS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/**
 * Generate a realistic display name from the pool
 */
export function generateBotDisplayName(index: number): string {
  const firstName = BOT_FIRST_NAMES[index % BOT_FIRST_NAMES.length];
  const lastInitial = BOT_LAST_INITIALS[(index * 7 + 3) % 26]; // deterministic but varied
  return `${firstName} ${lastInitial}.`;
}

/**
 * Generate a username from display name
 */
export function generateBotUsername(displayName: string, index: number): string {
  const clean = displayName
    .replace(/[^a-zA-Z]/g, '')
    .toLowerCase();
  return `${clean}_${(index % 999).toString().padStart(2, '0')}`;
}
