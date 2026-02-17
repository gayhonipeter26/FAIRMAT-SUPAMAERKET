<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import fairmatLogo from '@/assets/fairmat-logo.jpg';

const isNavOpen = ref(false);
const isCartOpen = ref(false);
const isLoginOpen = ref(false);
const isTrackingOpen = ref(false);
const isUtilityOpen = ref(false);

const toast = ref({
    show: false,
    message: '',
    icon: 'fa-check'
});
let toastTimer = null;

const showToast = (msg, icon = 'fa-check') => {
    toast.value = { show: true, message: msg, icon };
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.value.show = false;
    }, 3000);
};

const toggleUtility = () => {
    isUtilityOpen.value = !isUtilityOpen.value;
    if (isUtilityOpen.value) {
        isNavOpen.value = false;
        isCartOpen.value = false;
    }
};

const toggleLogin = () => {
    isLoginOpen.value = !isLoginOpen.value;
    if (isLoginOpen.value) {
        isNavOpen.value = false;
        isCartOpen.value = false;
        isTrackingOpen.value = false;
        isUtilityOpen.value = false;
    }
};

const toggleTracking = () => {
    isTrackingOpen.value = !isTrackingOpen.value;
    if (isTrackingOpen.value) {
        isNavOpen.value = false;
        isCartOpen.value = false;
        isLoginOpen.value = false;
        isUtilityOpen.value = false;
    }
};
const showFullMart = ref(localStorage.getItem('fairmat_view_full_mart') === 'true');
const bagCount = ref(0);
const totalDisplay = ref(0);
const activeFilter = ref('all');
const activeProtocolStep = ref(0); // For Membership Protocol Interaction
const activeMostBoughtIndex = ref(0); // For Dynamic Most Bought Carousel
let mostBoughtTimer = null;
const cartItems = ref([]);
const protocolLogs = [
    'Initiating profile cross-reference with the Fairmat Global Registry. Elite status verified.',
    'Deploying biometric and identity protocols to maintain integrity of Royal Card associations.',
    'Generating high-security institutional hashmaps. Physical Royal Card issuance in progress.',
    'Awaiting transactional sync. Real-time point accrual starts at 1,000 KES increments.'
];
const searchQuery = ref('');
const scrollY = ref(0);
const baseHeight = 320; // Initial "pill" height
const isLoading = ref(true);
const showScrollTop = ref(false);

// Page Navigation State (resets on refresh - not stored in localStorage)
const activePage = ref('home'); // home, about, global-inventory, procurement, supply-chain, shipping, returns, tracking, support, privacy, terms, ethics, compliance

const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
        const offset = 100; // Account for fixed header
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = el.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
};

// Navigate to a specific page
const navigateToPage = (pageName) => {
    activePage.value = pageName;
    scrollToTop();
    // Close any open overlays
    isNavOpen.value = false;
    isCartOpen.value = false;
};

// Go back to home
const goBackHome = () => {
    activePage.value = 'home';
    scrollToTop();
};

const categories = ref([
    { id: 'fruit-veg', name: 'Fresh Produce' },
    { id: 'dairy', name: 'Dairy & Eggs' },
    { id: 'meat', name: 'Meat & Fish' },
    { id: 'bakery', name: 'Artisanal Bakery' },
    { id: 'beverages', name: 'Beverages' },
    { id: 'pantry', name: 'Pantry Essentials' }
]);

const allProducts = ref([
    { name: 'Heirloom Tomato', category: 'fruit-veg', price: 350, img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Organic Farms' },
    { name: 'Gala Apple', category: 'fruit-veg', price: 450, img: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88c1?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Red Orchard' },
    { name: 'Premium Broccoli', category: 'fruit-veg', price: 950, img: 'https://images.unsplash.com/photo-1518173946687-a4c8a9833d8e?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Highland Fresh' },
    { name: 'Organic Avocado', category: 'fruit-veg', price: 150, img: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Mt. Kenya Fresh' },
    { name: 'Sweet Bananas', category: 'fruit-veg', price: 120, img: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Kisii Farms' },
    { name: 'Red Onions', category: 'fruit-veg', price: 200, img: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Local Harvest' },

    { name: 'Morning Milk', category: 'dairy', price: 180, img: 'https://images.unsplash.com/photo-1563636619-e910ef2a844b?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'A-Grade Dairy' },
    { name: 'Artisanal Cheese', category: 'dairy', price: 1200, img: 'https://images.unsplash.com/photo-1485962391905-dc1c4d7446cd?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Nyeri Highland' },
    { name: 'Greek Yogurt', category: 'dairy', price: 650, img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Creamy Delights' },
    { name: 'Free Range Eggs', category: 'dairy', price: 450, img: 'https://images.unsplash.com/photo-1516482738497-1529dfb8d817?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Yellow Yolk' },
    { name: 'Salted Butter', category: 'dairy', price: 850, img: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Churned Gold' },

    { name: 'Prime Beef Steak', category: 'meat', price: 1450, img: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Grass Fed' },
    { name: 'Norwegian Salmon', category: 'meat', price: 2800, img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Import Selection' },
    { name: 'Whole Chicken', category: 'meat', price: 900, img: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Kienyeji' },
    { name: 'Lamb Chops', category: 'meat', price: 1800, img: 'https://images.unsplash.com/photo-1602847752763-8a39e83690d2?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Molo Lamb' },

    { name: 'Artisanal Bread', category: 'bakery', price: 420, img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Stone Oven' },
    { name: 'Glazed Donuts', category: 'bakery', price: 250, img: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Aisle 4 Bakery' },
    { name: 'Croissants', category: 'bakery', price: 300, img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Buttery Flakes' },
    { name: 'Chocolate Cake', category: 'bakery', price: 3500, img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Decadent' },

    { name: 'Tropical Juice', category: 'beverages', price: 350, img: 'https://images.unsplash.com/photo-1621506289937-4c7dbb09ef53?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Fresh Squeezed' },
    { name: 'Sparkling Water', category: 'beverages', price: 150, img: 'https://images.unsplash.com/photo-1551613204-205101666870?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Natural Spring' },
    { name: 'Craft Beer', category: 'beverages', price: 400, img: 'https://images.unsplash.com/photo-1584225064785-c62a8b43d148?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Microbrew' },
    { name: 'Premium Coffee', category: 'beverages', price: 1200, img: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'AA Grade' },

    { name: 'Olive Oil', category: 'pantry', price: 2100, img: 'https://images.unsplash.com/photo-1474971904374-85bc97427931?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Extra Virgin' },
    { name: 'Organic Honey', category: 'pantry', price: 1100, img: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Wild Flower' },
    { name: 'Basmati Rice', category: 'pantry', price: 890, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Long Grain' },
    { name: 'Sea Salt', category: 'pantry', price: 150, img: 'https://images.unsplash.com/photo-1518110925495-5cb2b9084366?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Crystal' }
]);

const productsByCategory = (categoryId) => {
    return allProducts.value.filter(p => {
        const matchesCategory = categoryId === 'all' || p.category === categoryId;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.value);
        return matchesCategory && matchesSearch;
    });
};

const mostBought = computed(() => {
    return allProducts.value.slice(0, 4).map(p => ({ ...p, sold: Math.floor(Math.random() * 500) + 500 }));
});

const locations = ref([
    { name: 'Karen Crossroads', detail: 'Fairmat Plaza, Suite 40', status: 'Active Hub', phone: '+254 701 000 000' },
    { name: 'Muthaiga North', detail: 'Elite Wing, Highland Center', status: 'Premium Branch', phone: '+254 702 000 000' },
    { name: 'Westlands Nexus', detail: 'Registry Square, Floor 2', status: 'Corporate Desk', phone: '+254 703 000 000' },
    { name: 'Lavington Green', detail: 'Curated Mart, Block B', status: 'Lifestyle Branch', phone: '+254 704 000 000' }
]);

const testimonials = ref([
    {
        name: 'Adrian K. Omburo',
        role: 'Commercial Arbitrator',
        location: 'Muthaiga Heights',
        quote: 'The precision of Fairmat\'s inventory reflects the standard we maintain in the highlands. A truly institutional experience in artisanal procurement.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        id: 'AUTH-9421'
    },
    {
        name: 'Zahra M. Hassan',
        role: 'Global Curator',
        location: 'Gigiri Diplomatic District',
        quote: 'Fairmat has successfully digitized the prestige of Nairobi\'s elite markets. The Royal Card integration is seamless and conceptually brilliant.',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        id: 'AUTH-8832'
    },
    {
        name: 'Dr. Julianne Omondi',
        role: 'Neurosurgeon',
        location: 'Lavington Brooks',
        quote: 'Finally, a platform that understands the urgency of quality. Their registry system ensures every asset delivered to my residence is verified and pristine.',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        id: 'AUTH-7455'
    }
]);

const matrixData = computed(() => {
    const cats = activeFilter.value === 'all'
        ? categories.value
        : categories.value.filter(c => c.id === activeFilter.value);

    return cats.map(cat => ({
        ...cat,
        items: allProducts.value.filter(p =>
            p.category === cat.id &&
            p.name.toLowerCase().includes(searchQuery.value)
        )
    })).filter(group => group.items.length > 0);
});

const toggleNav = () => {
    isNavOpen.value = !isNavOpen.value;
    if (isNavOpen.value) isUtilityOpen.value = false;
};

const toggleCart = () => {
    isCartOpen.value = !isCartOpen.value;
    if (isCartOpen.value) isUtilityOpen.value = false;
};

const addToCart = (price, name = 'Product') => {
    bagCount.value++;
    totalDisplay.value += price;
    cartItems.value.push({ name, price });
    showToast(`${name} acquired`, 'fa-check');
};

const toggleMartView = (show) => {
    showFullMart.value = show;
    localStorage.setItem('fairmat_view_full_mart', show);
    if (show) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

const scrollCarousel = (direction) => {
    const carousel = document.getElementById('product-carousel');
    if (carousel) {
        carousel.scrollBy({ left: direction * 400, behavior: 'smooth' });
    }
};

const scrollRow = (event, direction) => {
    const container = event.target.closest('.category-row').querySelector('.category-carousel-container');
    if (container) {
        container.scrollBy({ left: direction * 400, behavior: 'smooth' });
    }
};

const toggleFaq = (event) => {
    const item = event.target.closest('.faq-item');
    const content = item.querySelector('.faq-content');
    const icon = item.querySelector('i.fa-chevron-down');

    const isHidden = content.classList.contains('hidden');

    // Close all others
    document.querySelectorAll('.faq-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.faq-item i.fa-chevron-down').forEach(el => el.classList.remove('rotate-180'));

    if (isHidden) {
        content.classList.remove('hidden');
        if (icon) icon.classList.add('rotate-180');
    }
};

const handleImageError = (event) => {
    event.target.src = 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80';
};

const currentSidebarHeight = computed(() => {
    const max = window.innerHeight - 32;
    // Immediate response: Grows by 1.5x the scroll amount
    return Math.min(baseHeight + scrollY.value * 1.5, max);
});

const globalObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

const observeElements = () => {
    nextTick(() => {
        document.querySelectorAll('.reveal').forEach(el => {
            globalObserver.observe(el);
        });
    });
};

onMounted(async () => {
    // ... (preloading logic stays same)
    const criticalUrls = [
        fairmatLogo,
        ...promos.value.map(p => p.img),
        ...mostBought.value.map(p => p.img),
        ...testimonials.value.map(t => t.avatar),
        'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80' // Map
    ];

    const preload = (url) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = resolve;
            img.src = url;
        });
    };

    Promise.all([
        Promise.race([
            Promise.all(criticalUrls.map(preload)),
            new Promise(resolve => setTimeout(resolve, 7000))
        ]),
        new Promise(resolve => setTimeout(resolve, 4000))
    ]).then(() => {
        isLoading.value = false;
        observeElements(); // Initial observation
    });

    const handleScroll = () => {
        scrollY.value = window.scrollY;
        showScrollTop.value = window.scrollY > 300;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    mostBoughtTimer = setInterval(() => {
        activeMostBoughtIndex.value = (activeMostBoughtIndex.value + 1) % 4;
    }, 5000);
});

onUnmounted(() => {
    if (mostBoughtTimer) clearInterval(mostBoughtTimer);
    globalObserver.disconnect();
});

watch([showFullMart, activePage], () => {
    observeElements();
});

// Modal Logic
const isModalVisible = ref(false);
const selectedProduct = ref({
    name: '',
    category: '',
    price: 0,
    img: '',
    desc: ''
});

const openProductModal = (product) => {
    selectedProduct.value = product;
    isModalVisible.value = true;
    document.body.classList.add('product-modal-open');
};

const closeProductModal = () => {
    isModalVisible.value = false;
    document.body.classList.remove('product-modal-open');
};

const filterProducts = (category, event) => {
    activeFilter.value = category;
    // Update button styles (handled by :class in template)
};

const searchProducts = (value) => {
    searchQuery.value = value.toLowerCase();
};

const currentPromoIdx = ref(0);
const promos = ref([
    {
        label: 'Weekend Flash Sale',
        badge: 'Ends In: 04:22:51',
        title: 'SAVE 50%',
        subtitle: 'of artisanal stock',
        img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=95',
        color: 'bg-brand'
    },
    {
        label: 'New Entry',
        badge: 'Just Landed',
        title: 'TECH NEXUS',
        subtitle: 'premium institutional gadgets',
        img: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1600&q=95',
        color: 'bg-navy'
    },
    {
        label: 'Bulk Registry',
        badge: 'Corporate Advantage',
        title: 'SAVE 15%',
        subtitle: 'on institutional bulk orders',
        img: 'https://images.unsplash.com/photo-1580674684081-761d50422f34?auto=format&fit=crop&w=1600&q=95',
        color: 'bg-slate-700'
    },
    {
        label: 'Institutional Card',
        badge: 'Elite Status',
        title: 'ROYAL CARD',
        subtitle: 'accrue points, unlock excellence',
        img: 'https://images.unsplash.com/photo-1620714223084-8dfbac6dfdca?auto=format&fit=crop&w=1600&q=95',
        color: 'bg-amber-600'
    }
]);

const nextPromo = () => {
    currentPromoIdx.value = (currentPromoIdx.value + 1) % promos.value.length;
};

const prevPromo = () => {
    currentPromoIdx.value = (currentPromoIdx.value - 1 + promos.value.length) % promos.value.length;
};



</script>

<template>
    <div id="fairmat-app" class="flex min-h-screen font-sans selection:bg-brand/10 selection:text-brand">



        <!-- PAGE LOADER ANIMATION -->
        <transition enter-active-class="duration-700 ease-out" leave-active-class="duration-700 ease-in"
            enter-from-class="opacity-0" leave-to-class="opacity-0">
            <div v-if="isLoading" class="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center">
                <div class="relative flex flex-col items-center">
                    <!-- The Nail -->
                    <div class="relative z-30 mb-[-12px]">
                        <!-- Nail Head -->
                        <div
                            class="w-4 h-4 bg-gradient-to-br from-slate-400 via-slate-800 to-black rounded-full shadow-lg ring-1 ring-black/40 border-b border-white/10">
                        </div>
                        <!-- Depth Shadow -->
                        <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-black/20 blur-[2px] rounded-full"></div>
                    </div>

                    <!-- The Logo (Hanging by its own handle) -->
                    <div class="relative flex flex-col items-center animate-swing origin-top transform-gpu">
                        <div class="w-48 h-48 flex items-center justify-center relative z-10 mt-[-24px]">
                            <img :src="fairmatLogo" fetchpriority="high" loading="eager"
                                class="w-full h-full object-contain mix-blend-multiply select-none pointer-events-none">
                        </div>
                    </div>
                </div>
            </div>
        </transition>

        <!-- TOAST NOTIFICATION -->
        <transition enter-active-class="transform ease-out duration-500 cubic-bezier(0.16, 1, 0.3, 1)"
            enter-from-class="-translate-y-full opacity-0 scale-90" enter-to-class="translate-y-0 opacity-100 scale-100"
            leave-active-class="transform ease-in duration-300 cubic-bezier(0.16, 1, 0.3, 1)"
            leave-from-class="translate-y-0 opacity-100 scale-100"
            leave-to-class="-translate-y-full opacity-0 scale-90">
            <div v-if="toast.show"
                class="fixed top-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-[200] flex justify-center pointer-events-none">
                <div
                    class="bg-navy/90 backdrop-blur-xl text-white pl-4 pr-6 py-3 rounded-full flex items-center gap-4 shadow-2xl border border-white/10 pointer-events-auto min-w-[300px] md:min-w-0">
                    <div class="w-8 h-8 rounded-full bg-brand flex items-center justify-center shrink-0 animate-pulse">
                        <i :class="['fas text-xs text-white', toast.icon]"></i>
                    </div>
                    <div>
                        <span class="text-[8px] font-black uppercase tracking-[0.2em] block text-brand mb-0.5">Registry
                            Update</span>
                        <span
                            class="text-xs md:text-sm font-serif italic text-white/90 whitespace-nowrap leading-none">{{
                                toast.message }}</span>
                    </div>
                </div>
            </div>
        </transition>

        <!-- LEFT SIDEBAR -->
        <aside id="main-sidebar" :style="{
            height: `${currentSidebarHeight}px`,
        }"
            class="fixed left-4 top-4 w-16 bg-sidebar rounded-full hidden md:flex flex-col items-center justify-between py-10 z-50 shadow-lg will-change-[height]">

            <button @click="toggleNav"
                class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition shrink-0 z-[60] relative">
                <i class="fas fa-bars text-brand"></i>
            </button>

            <div id="sidebar-text"
                class="flex-1 flex flex-col items-center justify-between py-12 overflow-hidden my-6 relative w-full opacity-60"
                style="letter-spacing: 0.4em;">
                <span
                    class="vertical-text uppercase font-black text-white text-[10px] transform hover:scale-110 hover:text-brand transition-all duration-300 cursor-default reveal animate-fade-in-up"
                    style="transition-delay: 100ms;">Fairmat</span>
                <span
                    class="vertical-text uppercase font-black text-white text-[10px] transform hover:scale-110 hover:text-brand transition-all duration-300 cursor-default reveal animate-fade-in-up"
                    style="transition-delay: 200ms;">Supermarket</span>
                <span
                    class="vertical-text uppercase font-black text-white text-[10px] transform hover:scale-110 hover:text-brand transition-all duration-300 cursor-default reveal animate-fade-in-up"
                    style="transition-delay: 300ms;">Ltd</span>
            </div>

            <div class="flex flex-col items-center gap-6 shrink-0 pb-2">
                <div class="w-10 h-10 flex items-center justify-center p-1">
                    <img :src="fairmatLogo" class="w-full h-full object-contain mix-blend-multiply">
                </div>
            </div>
        </aside>

        <!-- MAIN CONTENT -->
        <main class="ml-0 md:ml-20 flex-1 bg-white relative min-h-screen overflow-x-hidden">
            <div class="mx-auto p-5 md:p-8 lg:pt-8 lg:px-16 lg:pb-16 max-w-[1600px]">

                <!-- FLOATING BRAND AURA CONTENT-SIDE -->
                <div class="fixed top-0 right-0 w-[30%] h-[30%] bg-sidebar/5 rounded-full filter blur-[100px] -z-10">
                </div>
                <div class="fixed bottom-0 left-20 w-[20%] h-[20%] bg-brand/5 rounded-full filter blur-[80px] -z-10">
                </div>

                <!-- HEADER / TOP ROW -->
                <header
                    class="fixed top-4 right-4 lg:top-6 lg:right-10 z-[60] flex items-center justify-end gap-2 md:gap-4">

                    <!-- Desktop-only Utility Buttons (shown on mobile when toggled) -->
                    <div :class="[
                        'flex items-center gap-2 md:gap-4 transition-all duration-300',
                        isUtilityOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none md:opacity-100 md:translate-x-0 md:pointer-events-auto'
                    ]">
                        <!-- Tracking Button -->
                        <button @click="toggleTracking"
                            class="w-10 h-10 md:w-14 md:h-14 bg-white text-navy rounded-full flex items-center justify-center shadow-lg hover:bg-brand hover:text-white transition relative border border-gray-100 group">
                            <i class="fas fa-map-marker-alt text-sm md:text-lg group-hover:animate-bounce"></i>
                            <span
                                class="absolute -bottom-10 right-0 bg-navy text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Track
                                Order</span>
                        </button>

                        <!-- Profile Button -->
                        <button @click="toggleLogin"
                            class="w-10 h-10 md:w-14 md:h-14 bg-white text-navy rounded-full flex items-center justify-center shadow-lg hover:bg-brand hover:text-white transition relative border border-gray-100 group">
                            <i class="fas fa-user-circle text-sm md:text-lg"></i>
                            <span
                                class="absolute -bottom-10 right-0 bg-navy text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Registry
                                Login</span>
                        </button>
                    </div>

                    <!-- Utility Toggle (Mobile Only) -->
                    <button @click="toggleUtility"
                        class="md:hidden w-10 h-10 bg-white text-navy rounded-full flex items-center justify-center shadow-lg hover:bg-brand hover:text-white transition relative border border-gray-100">
                        <i
                            :class="['fas text-sm transition-transform duration-300', isUtilityOpen ? 'fa-times rotate-90' : 'fa-cog']"></i>
                    </button>

                    <!-- Nav Toggle -->
                    <button @click="toggleNav"
                        class="md:hidden w-10 h-10 bg-white text-navy rounded-full flex items-center justify-center shadow-lg hover:bg-brand hover:text-white transition relative border border-gray-100">
                        <i class="fas fa-bars text-sm"></i>
                    </button>

                    <!-- Desktop Cart Button (Moved to bottom on mobile) -->
                    <button @click="toggleCart"
                        class="hidden md:flex w-12 h-12 md:w-16 md:h-16 bg-brand text-white rounded-full items-center justify-center shadow-2xl hover:scale-110 transition relative">
                        <i class="fas fa-shopping-basket text-base md:text-xl"></i>
                        <span id="bagCount"
                            class="absolute -top-1 -right-1 w-4 h-4 md:w-6 md:h-6 bg-navy rounded-full border-2 border-white text-[8px] md:text-[10px] font-black flex items-center justify-center">{{
                                bagCount }}</span>
                    </button>
                </header>

                <!-- CONTENT PAGES (Only shown when navigating from footer links) -->
                <div v-if="activePage !== 'home'" class="min-h-screen pt-24 pb-20">
                    <!-- Back Button -->
                    <button @click="goBackHome"
                        class="mb-8 flex items-center gap-3 text-navy hover:text-brand transition-colors group">
                        <i class="fas fa-arrow-left text-sm group-hover:-translate-x-1 transition-transform"></i>
                        <span class="text-[11px] font-black uppercase tracking-[0.3em]">Back to Home</span>
                    </button>

                    <!-- About the Mart Page -->
                    <div v-if="activePage === 'about'" class="max-w-5xl mx-auto space-y-12 md:space-y-20 reveal">
                        <div class="text-center space-y-6">
                            <span
                                class="text-[10px] font-black uppercase tracking-[0.6em] text-brand block">Institutional
                                Heritage</span>
                            <h1
                                class="text-3xl md:text-8xl font-black text-navy uppercase leading-[0.9] tracking-tighter">
                                About the <br><span
                                    class="text-brand italic font-serif lowercase text-4xl md:text-9xl">Mart</span>
                            </h1>
                        </div>

                        <div class="grid md:grid-cols-2 gap-16 items-center">
                            <div class="space-y-8">
                                <p
                                    class="text-2xl font-serif italic text-navy/80 leading-relaxed border-l-4 border-brand pl-8">
                                    Fairmat Supermarket Ltd represents the pinnacle of retail excellence in Kenya,
                                    bridging artisanal quality with institutional standards.
                                </p>
                                <p class="text-lg text-navy/60 leading-relaxed">
                                    Established in 2024, our mandate is the democratization of premium procurement,
                                    connecting the finest yields of Kenya to elite citizenry. We maintain rigorous
                                    quality protocols across our entire supply chain.
                                </p>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="p-8 bg-surface rounded-3xl border border-navy/5 text-center space-y-3">
                                    <span class="text-4xl font-black text-brand">2024</span>
                                    <p class="text-[10px] font-black uppercase tracking-widest text-navy/40">Established
                                    </p>
                                </div>
                                <div class="p-8 bg-navy rounded-3xl text-center space-y-3 text-white">
                                    <span class="text-4xl font-black text-brand">5k+</span>
                                    <p class="text-[10px] font-black uppercase tracking-widest text-white/40">Elite
                                        Members</p>
                                </div>
                            </div>
                        </div>

                        <div class="grid md:grid-cols-3 gap-8">
                            <div v-for="(v, i) in [
                                { t: 'Integrity', d: 'Uncompromising standards in every transaction.', icon: 'fa-shield-check' },
                                { t: 'Excellence', d: 'Redefining the boundaries of retail quality.', icon: 'fa-crown' },
                                { t: 'Community', d: 'Empowering local artisanal ecosystems.', icon: 'fa-hand-holding-seedling' }
                            ]" :key="i"
                                class="p-10 bg-white border border-navy/5 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group">
                                <i
                                    :class="['fas', v.icon, 'text-3xl text-brand mb-6 group-hover:scale-110 transition-transform']"></i>
                                <h3 class="text-xl font-black text-navy uppercase mb-4">{{ v.t }}</h3>
                                <p class="text-sm text-navy/60 leading-relaxed">{{ v.d }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Global Inventory Page -->
                    <div v-if="activePage === 'global-inventory'"
                        class="max-w-6xl mx-auto space-y-12 md:space-y-20 reveal">
                        <div class="text-center space-y-6">
                            <span class="text-[10px] font-black uppercase tracking-[0.6em] text-brand block">Premium
                                Curation</span>
                            <h1
                                class="text-3xl md:text-8xl font-black text-navy uppercase leading-[0.9] tracking-tighter">
                                Global <br><span
                                    class="text-brand italic font-serif lowercase text-4xl md:text-9xl">Inventory</span>
                            </h1>
                        </div>

                        <div class="grid md:grid-cols-4 gap-6">
                            <div v-for="(stat, i) in [
                                { l: 'SKUs', v: '2,500+' },
                                { l: 'Suppliers', v: '150+' },
                                { l: 'Categories', v: '12' },
                                { l: 'Quality Audits', v: 'Daily' }
                            ]" :key="i" class="p-8 bg-surface rounded-3xl border border-navy/5 text-center">
                                <p class="text-[10px] font-black uppercase tracking-widest text-navy/40 mb-2">{{ stat.l
                                }}</p>
                                <span class="text-3xl font-black text-navy">{{ stat.v }}</span>
                            </div>
                        </div>

                        <div class="grid md:grid-cols-2 gap-12">
                            <div class="space-y-8">
                                <h3 class="text-3xl font-black text-navy uppercase tracking-tighter">Artisanal Sourcing
                                </h3>
                                <p class="text-lg text-navy/60 leading-relaxed font-serif italic">
                                    Our inventory is not merely a collection of products, but a curated registry of the
                                    finest artisanal and organic yields from across the continent.
                                </p>
                                <div class="space-y-4">
                                    <div v-for="item in ['Certified Organic Produce', 'State-of-the-Art Electronics', 'Luxury Pantry Staples']"
                                        :key="item"
                                        class="flex items-center gap-4 p-4 bg-white border border-navy/5 rounded-2xl">
                                        <i class="fas fa-check-circle text-brand"></i>
                                        <span class="text-sm font-black uppercase tracking-widest text-navy">{{ item
                                        }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-navy rounded-[3rem] p-12 text-white relative overflow-hidden">
                                <div class="relative z-10 space-y-6">
                                    <span class="text-[10px] font-black uppercase tracking-widest text-brand">Quality
                                        Protocol</span>
                                    <h4 class="text-3xl font-black uppercase leading-tight">The Fairmat <br>Gold
                                        Standard</h4>
                                    <p class="text-sm text-white/60 leading-relaxed">Every item in our registry
                                        undergoes a 12-point quality verification process before reaching our shelves.
                                    </p>
                                    <button
                                        class="px-8 py-4 bg-brand text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-navy transition-all">View
                                        Registry Ledger</button>
                                </div>
                                <i
                                    class="fas fa-microscope absolute -bottom-10 -right-10 text-[12rem] text-white/5"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Procurement Registry Page -->
                    <div v-if="activePage === 'procurement'" class="max-w-5xl mx-auto space-y-12 md:space-y-20 reveal">
                        <div class="text-center space-y-6">
                            <span
                                class="text-[10px] font-black uppercase tracking-[0.6em] text-brand block">Governance</span>
                            <h1
                                class="text-3xl md:text-8xl font-black text-navy uppercase leading-[0.9] tracking-tighter">
                                Procurement <br><span
                                    class="text-brand italic font-serif lowercase text-4xl md:text-9xl">Registry</span>
                            </h1>
                        </div>

                        <div class="space-y-12">
                            <div class="p-12 bg-navy rounded-[3rem] text-white relative overflow-hidden">
                                <div class="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                                    <div class="space-y-6">
                                        <h3 class="text-3xl font-black uppercase leading-tight">Institutional
                                            <br>Vetting Protocol
                                        </h3>
                                        <p class="text-lg text-white/60 font-serif italic">"Transparency is our primary
                                            currency in the global supply chain."</p>
                                    </div>
                                    <div class="space-y-8">
                                        <div v-for="(step, i) in ['Supplier Integrity Check', 'Sustainability Audit', 'Quality Hash Mapping', 'Ethical Compliance Sync']"
                                            :key="i" class="flex items-center gap-6">
                                            <div
                                                class="w-10 h-10 rounded-full bg-brand flex items-center justify-center font-black text-navy text-xs">
                                                0{{ i + 1 }}</div>
                                            <span class="text-xs font-black uppercase tracking-widest text-white/80">{{
                                                step }}</span>
                                        </div>
                                    </div>
                                </div>
                                <i
                                    class="fas fa-file-signature absolute -bottom-10 -right-10 text-[15rem] text-white/5"></i>
                            </div>

                            <div class="grid md:grid-cols-3 gap-8">
                                <div v-for="(v, i) in [
                                    { t: 'Traceability', d: 'Farm-to-shelf tracking for every individual unit.', i: 'fa-search-location' },
                                    { t: 'Sustainability', d: 'Carbon-neutral logistics and eco-certified packaging.', i: 'fa-leaf' },
                                    { t: 'Integrity', d: 'Direct-from-source procurement bypassing intermediaries.', i: 'fa-link' }
                                ]" :key="i"
                                    class="p-10 bg-surface border border-navy/5 rounded-[2.5rem] group hover:bg-brand transition-all duration-700">
                                    <i :class="['fas', v.i, 'text-3xl text-brand group-hover:text-white mb-6']"></i>
                                    <h3 class="text-xl font-black text-navy group-hover:text-white uppercase mb-4">{{
                                        v.t }}</h3>
                                    <p class="text-sm text-navy/60 group-hover:text-white/70 leading-relaxed">{{ v.d }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Supply Chain Page -->
                    <div v-if="activePage === 'supply-chain'" class="max-w-6xl mx-auto space-y-12 md:space-y-20 reveal">
                        <div class="text-center space-y-6">
                            <span class="text-[10px] font-black uppercase tracking-[0.6em] text-brand block">Logistics
                                Engine</span>
                            <h1
                                class="text-3xl md:text-8xl font-black text-navy uppercase leading-[0.9] tracking-tighter">
                                Supply <br><span
                                    class="text-brand italic font-serif lowercase text-4xl md:text-9xl">Chain</span>
                            </h1>
                        </div>

                        <div class="grid lg:grid-cols-2 gap-16 items-center">
                            <div class="relative rounded-[3rem] overflow-hidden shadow-2xl group">
                                <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"
                                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000">
                                <div class="absolute inset-0 bg-navy/20"></div>
                            </div>
                            <div class="space-y-10">
                                <div class="space-y-4">
                                    <h3 class="text-3xl font-black text-navy uppercase tracking-tighter">Digital Nervous
                                        System</h3>
                                    <p class="text-lg text-navy/60 leading-relaxed font-serif italic">
                                        "Our logistics stack utilizes AI-driven routing and real-time cold-chain
                                        monitoring."
                                    </p>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div v-for="(feat, i) in [
                                        { t: 'Cold Chain', d: 'Automated thermal sensors.', i: 'fa-snowflake' },
                                        { t: 'AI Routing', d: 'Next-gen delivery pathing.', i: 'fa-network-wired' },
                                        { t: 'Real-time', d: 'Live fulfillment registry.', i: 'fa-clock' },
                                        { t: 'Eco-Fleet', d: 'Minimized carbon footprint.', i: 'fa-leaf' }
                                    ]" :key="i" class="p-6 bg-surface rounded-2xl border border-navy/5 space-y-3">
                                        <i :class="['fas', feat.i, 'text-brand']"></i>
                                        <h4 class="text-sm font-black text-navy uppercase">{{ feat.t }}</h4>
                                        <p class="text-xs text-navy/40 uppercase font-black">{{ feat.d }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            class="p-12 border border-navy/5 bg-white rounded-[3.5rem] relative overflow-hidden text-center">
                            <div class="max-w-3xl mx-auto space-y-8">
                                <span class="text-[10px] font-black uppercase tracking-[0.6em] text-brand">Network
                                    Status</span>
                                <h3 class="text-4xl font-black text-navy uppercase tracking-tighter">99.9% Fulfillment
                                    Integrity</h3>
                                <p class="text-lg text-navy/60 leading-relaxed px-12 italic font-serif">
                                    Through continuous innovation and institutional rigor, we maintain a supply chain
                                    that never sleeps, ensuring your excellence is delivered on demand.
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Shipping Protocol Page -->
                    <div v-if="activePage === 'shipping'" class="max-w-5xl mx-auto space-y-12 md:space-y-20 reveal">
                        <div class="text-center space-y-6">
                            <span class="text-[10px] font-black uppercase tracking-[0.6em] text-brand block">Rapid
                                Deployment</span>
                            <h1
                                class="text-3xl md:text-8xl font-black text-navy uppercase leading-[0.9] tracking-tighter">
                                Shipping <br><span
                                    class="text-brand italic font-serif lowercase text-4xl md:text-9xl">Protocol</span>
                            </h1>
                        </div>

                        <div class="grid md:grid-cols-2 gap-8">
                            <div class="p-12 bg-navy rounded-[3rem] text-white space-y-10 relative overflow-hidden">
                                <div class="relative z-10 space-y-6">
                                    <h3 class="text-3xl font-black uppercase tracking-tighter">Nairobi <br>Nexus
                                        Delivery</h3>
                                    <div class="space-y-4">
                                        <div v-for="(zone, i) in ['Zone A: 60-Min Express', 'Zone B: Same-Day Priority', 'Zone C: Targeted Scheduled']"
                                            :key="i"
                                            class="flex items-center justify-between border-b border-white/10 pb-4">
                                            <span
                                                class="text-[10px] font-black uppercase tracking-widest text-white/60">{{
                                                    zone }}</span>
                                            <i class="fas fa-bolt text-brand text-[8px]"></i>
                                        </div>
                                    </div>
                                    <p class="text-[10px] font-black uppercase tracking-widest text-brand mt-12">
                                        Institutional Delivery Standards</p>
                                </div>
                                <i
                                    class="fas fa-shipping-fast absolute -bottom-10 -right-10 text-[15rem] text-white/5"></i>
                            </div>
                            <div class="space-y-12">
                                <div class="space-y-6">
                                    <h3 class="text-3xl font-black text-navy uppercase tracking-tighter">Nationwide
                                        Network</h3>
                                    <p class="text-lg text-navy/60 font-serif italic leading-relaxed">"Across all 47
                                        counties, our protocol remains uncompromised."</p>
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div v-for="c in ['Safe Passage', 'Elite Handling', 'Point Tracking', 'Express Sync']"
                                        :key="c"
                                        class="p-6 border border-navy/5 rounded-3xl flex flex-col items-center text-center gap-3 bg-white hover:border-brand transition-colors">
                                        <i class="fas fa-check text-brand text-[8px]"></i>
                                        <span class="text-[9px] font-black uppercase tracking-widest text-navy">{{ c
                                        }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Returns Registry Page -->
                    <div v-if="activePage === 'returns'" class="max-w-5xl mx-auto space-y-12 md:space-y-20 reveal">
                        <div class="text-center space-y-6">
                            <span
                                class="text-[10px] font-black uppercase tracking-[0.6em] text-brand block">Institutional
                                Guarantee</span>
                            <h1
                                class="text-3xl md:text-8xl font-black text-navy uppercase leading-[0.9] tracking-tighter">
                                Returns <br><span
                                    class="text-brand italic font-serif lowercase text-4xl md:text-9xl">Registry</span>
                            </h1>
                        </div>

                        <div class="grid md:grid-cols-2 gap-12">
                            <div class="space-y-8">
                                <p
                                    class="text-2xl font-serif italic text-navy/80 leading-relaxed border-l-4 border-brand pl-8">
                                    Our commitment to your satisfaction is absolute. Every registry transaction is
                                    backed by our Institutional Quality Shield.
                                </p>
                                <div class="space-y-6">
                                    <div v-for="(policy, idx) in [
                                        { t: 'Freshness window', d: '24-hour instant credit for produce.', icon: 'fa-leaf' },
                                        { t: 'General Goods', d: '7-day seamless return protocol.', icon: 'fa-box-open' },
                                        { t: 'Digital Credit', d: 'Instant institutional trolley balance sync.', icon: 'fa-sync' }
                                    ]" :key="idx"
                                        class="flex gap-6 p-6 bg-white border border-navy/5 rounded-3xl group hover:border-brand transition-all">
                                        <i :class="['fas', policy.icon, 'text-xl text-brand']"></i>
                                        <div>
                                            <h4 class="text-sm font-black uppercase tracking-widest text-navy">{{
                                                policy.t }}</h4>
                                            <p class="text-xs text-navy/50 mt-1 uppercase font-black">{{ policy.d }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div
                                class="bg-surface rounded-[3rem] p-12 border border-navy/10 flex flex-col justify-between">
                                <div class="space-y-8">
                                    <h3 class="text-3xl font-black text-navy uppercase tracking-tighter">Initiate Return
                                    </h3>
                                    <p class="text-sm text-navy/60 leading-relaxed font-serif italic">
                                        Please provide your Registry ID and Transaction Hash to begin the automated
                                        reclamation protocol.
                                    </p>
                                    <div class="space-y-4">
                                        <input type="text" placeholder="TRANSACTION HASH (#FM-000-00)"
                                            class="w-full bg-white border border-navy/10 p-5 rounded-2xl text-[10px] font-mono tracking-widest focus:border-brand outline-none transition-all">
                                        <button
                                            class="w-full bg-navy text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand transition-all shadow-xl">Process
                                            Protocol</button>
                                    </div>
                                </div>
                                <div class="mt-12 pt-12 border-t border-navy/5">
                                    <p class="text-[9px] font-black uppercase tracking-[0.4em] text-navy/20">Status:
                                        Automated Recovery Enabled</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Order Tracking Page -->
                    <div v-if="activePage === 'tracking'" class="max-w-5xl mx-auto space-y-12 md:space-y-20 reveal">
                        <div class="text-center space-y-6">
                            <span class="text-[10px] font-black uppercase tracking-[0.6em] text-brand block">Real-time
                                Visibility</span>
                            <h1
                                class="text-3xl md:text-8xl font-black text-navy uppercase leading-[0.9] tracking-tighter">
                                Order <br><span
                                    class="text-brand italic font-serif lowercase text-4xl md:text-9xl">Tracking</span>
                            </h1>
                        </div>

                        <div class="max-w-3xl mx-auto">
                            <div
                                class="bg-navy rounded-[3.5rem] p-12 lg:p-20 text-white relative overflow-hidden group">
                                <div class="relative z-10 space-y-12">
                                    <div class="text-center space-y-4">
                                        <h3 class="text-3xl font-black uppercase tracking-tighter">Terminal Command</h3>
                                        <p class="text-lg text-white/40 font-serif italic">Enter your Registry ID to
                                            sync with our logistics nexus.</p>
                                    </div>
                                    <div class="relative">
                                        <input type="text" placeholder="ENTER REGISTRY ID..."
                                            class="w-full bg-white/5 border border-white/10 p-8 rounded-[2rem] text-2xl font-black tracking-[0.2em] focus:border-brand outline-none transition-all placeholder:text-white/10 uppercase text-center">
                                        <button
                                            class="mt-8 w-full bg-brand text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] hover:bg-white hover:text-navy transition-all shadow-2xl">Execute
                                            Tracking Scan</button>
                                    </div>
                                    <div class="pt-8 flex justify-center gap-12 border-t border-white/5">
                                        <div v-for="s in ['GPS Sync: Active', 'Chain: Verified', 'Status: Live']"
                                            :key="s" class="flex items-center gap-2">
                                            <div class="w-2 h-2 rounded-full bg-brand animate-pulse"></div>
                                            <span
                                                class="text-[9px] font-black uppercase tracking-widest text-white/40">{{
                                                    s }}</span>
                                        </div>
                                    </div>
                                </div>
                                <i
                                    class="fas fa-satellite-dish absolute -bottom-20 -right-20 text-[25rem] text-white/[0.02] group-hover:scale-110 transition-transform duration-1000"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Nexus Support Page -->
                    <div v-if="activePage === 'support'" class="max-w-6xl mx-auto space-y-12 md:space-y-20 reveal">
                        <div class="text-center space-y-6">
                            <span class="text-[10px] font-black uppercase tracking-[0.6em] text-brand block">24/7
                                Concierge</span>
                            <h1
                                class="text-3xl md:text-8xl font-black text-navy uppercase leading-[0.9] tracking-tighter">
                                Nexus <br><span
                                    class="text-brand italic font-serif lowercase text-4xl md:text-9xl">Support</span>
                            </h1>
                        </div>

                        <div class="grid lg:grid-cols-3 gap-8">
                            <div v-for="(s, i) in [
                                { t: 'Elite Voice', d: '+254 700 000 000', i: 'fa-phone-volume', l: 'Immediate Response' },
                                { t: 'Digital Ledger', d: 'support@fairmat.co.ke', i: 'fa-envelope-open-text', l: 'Resolution in 4h' },
                                { t: 'Live Terminal', d: 'Secure Web-Chat', i: 'fa-comment-dots', l: 'Real-time Sync' }
                            ]" :key="i"
                                class="p-12 bg-white border border-navy/5 rounded-[3rem] text-center space-y-6 hover:shadow-2xl transition-all duration-700">
                                <div
                                    class="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
                                    <i :class="['fas', s.i, 'text-3xl text-brand']"></i>
                                </div>
                                <h3 class="text-xl font-black text-navy uppercase tracking-tight">{{ s.t }}</h3>
                                <p class="text-2xl font-serif italic text-brand">{{ s.d }}</p>
                                <span class="text-[9px] font-black uppercase tracking-widest text-navy/30 block">{{ s.l
                                }}</span>
                            </div>
                        </div>

                        <div class="p-16 bg-navy rounded-[3.5rem] text-center relative overflow-hidden group">
                            <div class="relative z-10 max-w-2xl mx-auto space-y-8">
                                <h3 class="text-4xl font-black text-white uppercase tracking-tighter leading-none">Need
                                    <br>Institutional <span
                                        class="text-brand italic font-serif lowercase">Assistance?</span>
                                </h3>
                                <p class="text-lg text-white/50 leading-relaxed font-serif italic">"Your peace of mind
                                    is the ultimate metric of our performance."</p>
                                <button
                                    class="px-12 py-5 bg-brand text-white rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-navy transition-all shadow-xl">Initiate
                                    Protocol</button>
                            </div>
                            <i
                                class="fas fa-headset absolute -top-10 -left-10 text-[20rem] text-white/5 group-hover:rotate-12 transition-transform duration-1000"></i>
                        </div>
                    </div>

                    <!-- Privacy Charter Page -->
                    <div v-if="activePage === 'privacy'" class="max-w-5xl mx-auto space-y-12 md:space-y-20 reveal">
                        <div class="text-center space-y-6">
                            <span class="text-[10px] font-black uppercase tracking-[0.6em] text-brand block">Data
                                Integrity</span>
                            <h1
                                class="text-3xl md:text-8xl font-black text-navy uppercase leading-[0.9] tracking-tighter">
                                Privacy <br><span
                                    class="text-brand italic font-serif lowercase text-4xl md:text-9xl">Charter</span>
                            </h1>
                        </div>

                        <div class="grid md:grid-cols-2 gap-16">
                            <div class="space-y-10">
                                <h3 class="text-3xl font-black text-navy uppercase tracking-tighter">Institutional
                                    Security</h3>
                                <p
                                    class="text-lg text-navy/60 leading-relaxed font-serif italic border-l-4 border-brand pl-8">
                                    "Your data is treated as an institutional asset, protected by enterprise-grade
                                    encryption and rigorous access controls."
                                </p>
                                <div class="space-y-4">
                                    <div v-for="(p, i) in ['256-bit AES Encryption', 'Zero-party Data Storage', 'Strict GDPR & DPA Compliance', 'Biometric Registry Sec']"
                                        :key="i"
                                        class="flex items-center gap-4 p-5 bg-white border border-navy/5 rounded-2xl">
                                        <i class="fas fa-lock text-brand text-[10px]"></i>
                                        <span class="text-[10px] font-black uppercase tracking-widest text-navy">{{ p
                                            }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="p-12 bg-surface rounded-[3rem] border border-navy/5 space-y-8">
                                <h4 class="text-xl font-black text-navy uppercase tracking-widest">Our Mandate</h4>
                                <div class="space-y-6 text-sm text-navy/60 leading-loose">
                                    <p>Fairmat Supermarket Ltd is committed to the highest standards of data governance.
                                        We collect only what is essential for your excellence, ensuring your digital
                                        footprint remains as refined as your procurement choices.</p>
                                    <p>We do not participate in the trade of personal data. Your registry details are
                                        used exclusively to enhance your institutional experience within the Fairmat
                                        ecosystem.</p>
                                </div>
                                <button
                                    class="text-[10px] font-black uppercase tracking-widest text-brand border-b-2 border-brand/20 pb-2 hover:border-brand transition-all">Download
                                    Full Protocol Document</button>
                            </div>
                        </div>
                    </div>

                    <!-- Terms of Service Page -->
                    <div v-if="activePage === 'terms'" class="max-w-5xl mx-auto space-y-12 md:space-y-20 reveal">
                        <div class="text-center space-y-6">
                            <span class="text-[10px] font-black uppercase tracking-[0.6em] text-brand block">Legal
                                Framework</span>
                            <h1
                                class="text-3xl md:text-8xl font-black text-navy uppercase leading-[0.9] tracking-tighter">
                                Terms of <br><span
                                    class="text-brand italic font-serif lowercase text-4xl md:text-9xl">Service</span>
                            </h1>
                        </div>

                        <div class="prose prose-lg max-w-none space-y-12">
                            <div class="p-12 bg-navy rounded-[3.5rem] text-white">
                                <h3 class="text-3xl font-black uppercase leading-tight text-white mb-6">Institutional
                                    Agreement</h3>
                                <p class="text-xl text-white/60 font-serif italic border-l-4 border-brand pl-8">
                                    "Accessing the Fairmat Registry implies a mutual commitment to excellence and
                                    integrity."
                                </p>
                            </div>

                            <div class="grid md:grid-cols-3 gap-12">
                                <div v-for="(t, i) in [
                                    { h: 'Eligibility', d: 'Membership is restricted to individuals aged 18+ within the Kenyan administrative boundaries.' },
                                    { h: 'Use of Proxy', d: 'Unauthorized access via third-party procurement proxies is strictly prohibited.' },
                                    { h: 'Termination', d: 'Institutional accounts may be suspended for breach of ethical protocols.' }
                                ]" :key="i" class="space-y-4">
                                    <h4 class="text-lg font-black text-navy uppercase tracking-widest">{{ t.h }}</h4>
                                    <p class="text-sm text-navy/50 leading-relaxed">{{ t.d }}</p>
                                </div>
                            </div>

                            <div class="pt-12 border-t border-navy/5">
                                <p class="text-xs text-navy/40 uppercase font-black tracking-widest text-center">Last
                                    Registry Update: February 2024 • Version 2.0.1-Release</p>
                            </div>
                        </div>
                    </div>

                    <!-- Member Ethics Page -->
                    <div v-if="activePage === 'ethics'" class="max-w-5xl mx-auto space-y-12 md:space-y-20 reveal">
                        <div class="text-center space-y-6">
                            <span class="text-[10px] font-black uppercase tracking-[0.6em] text-brand block">Conduct
                                Registry</span>
                            <h1
                                class="text-3xl md:text-8xl font-black text-navy uppercase leading-[0.9] tracking-tighter">
                                Member <br><span
                                    class="text-brand italic font-serif lowercase text-4xl md:text-9xl">Ethics</span>
                            </h1>
                        </div>

                        <div class="grid lg:grid-cols-2 gap-16 items-center">
                            <div class="space-y-12">
                                <div class="space-y-6">
                                    <h3 class="text-3xl font-black text-navy uppercase tracking-tighter">The Registry
                                        Honor Code</h3>
                                    <p class="text-lg text-navy/60 leading-relaxed font-serif italic">
                                        "Excellence is not a status, but a continuous practice of ethical procurement."
                                    </p>
                                </div>
                                <div class="grid grid-cols-1 gap-6">
                                    <div v-for="(rule, i) in [
                                        { t: 'Respect the Cycle', d: 'Honoring the seasonal artisanal yields of our partner farms.', i: 'fa-seedling' },
                                        { t: 'Digital Integrity', d: 'Maintaining the security of institutional registry credentials.', i: 'fa-user-shield' },
                                        { t: 'Community Sync', d: 'Participating in the collective prosperity of the Fairmat network.', i: 'fa-users' }
                                    ]" :key="i"
                                        class="p-8 bg-surface rounded-[2rem] border border-navy/5 flex gap-8 group hover:border-brand transition-all">
                                        <i
                                            :class="['fas', rule.i, 'text-2xl text-brand group-hover:scale-110 transition-transform']"></i>
                                        <div>
                                            <h4 class="text-sm font-black text-navy uppercase tracking-widest">{{ rule.t
                                                }}</h4>
                                            <p class="text-xs text-navy/40 mt-2 leading-relaxed uppercase font-black">{{
                                                rule.d }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="relative group">
                                <div
                                    class="absolute inset-0 bg-brand rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity">
                                </div>
                                <div class="relative bg-navy rounded-[3rem] p-12 text-white space-y-10 overflow-hidden">
                                    <h3 class="text-3xl font-black uppercase leading-tight">Elite <br>Membership
                                        <br>Standards
                                    </h3>
                                    <div class="space-y-4">
                                        <div v-for="std in ['Fairness in all dealings', 'Support for local artisans', 'Sustainable consumption', 'Registry Compliance']"
                                            :key="std" class="flex items-center gap-4">
                                            <i class="fas fa-check text-brand text-[8px]"></i>
                                            <span
                                                class="text-[10px] font-black uppercase tracking-widest text-white/60">{{
                                                    std }}</span>
                                        </div>
                                    </div>
                                    <div class="pt-8 border-t border-white/5">
                                        <p class="text-[8px] font-mono text-white/20">Protocol: FM-ETHICS-2024-V1</p>
                                    </div>
                                    <i
                                        class="fas fa-handshake absolute -bottom-10 -right-10 text-[15rem] text-white/5"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Compliance Page -->
                    <div v-if="activePage === 'compliance'" class="max-w-5xl mx-auto space-y-12 md:space-y-20 reveal">
                        <div class="text-center space-y-6">
                            <span
                                class="text-[10px] font-black uppercase tracking-[0.6em] text-brand block">Institutional
                                Audit</span>
                            <h1
                                class="text-3xl md:text-8xl font-black text-navy uppercase leading-[0.9] tracking-tighter">
                                Compliance <br><span
                                    class="text-brand italic font-serif lowercase text-4xl md:text-9xl">Framework</span>
                            </h1>
                        </div>

                        <div class="grid md:grid-cols-2 gap-12">
                            <div class="p-12 border-2 border-brand/10 rounded-[3rem] space-y-8 bg-brand/5">
                                <h3 class="text-3xl font-black text-navy uppercase tracking-tighter">Regulatory
                                    <br>Alignment
                                </h3>
                                <p class="text-lg text-navy/70 font-serif italic leading-relaxed">
                                    Full compliance with KEBS standards, KRA institutional mandates, and international
                                    ESG best practices.
                                </p>
                                <div class="grid grid-cols-2 gap-4">
                                    <div v-for="b in ['KEBS Certified', 'ISO 9001', 'ESG Rated', 'HACCP Sync']" :key="b"
                                        class="flex items-center gap-3 p-4 bg-white rounded-2xl border border-navy/5">
                                        <i class="fas fa-certificate text-brand"></i>
                                        <span class="text-[8px] font-black uppercase tracking-widest text-navy">{{ b
                                        }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="space-y-12">
                                <div class="space-y-6">
                                    <h3 class="text-3xl font-black text-navy uppercase tracking-tighter">Continuous
                                        Integrity</h3>
                                    <p class="text-lg text-navy/60 leading-relaxed">
                                        Our framework is not a static document but a live, evolving registry of
                                        compliance events and audits.
                                    </p>
                                </div>
                                <div class="space-y-4">
                                    <div v-for="(p, i) in ['Quarterly Institutional Audits', 'Daily Safety Pulse Checks', 'Annual Transparency Report']"
                                        :key="i"
                                        class="flex justify-between items-center p-6 bg-surface rounded-2xl border border-navy/5">
                                        <span class="text-xs font-black uppercase tracking-widest text-navy">{{ p
                                        }}</span>
                                        <div class="w-12 h-1 bg-brand rounded-full opacity-20"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- CLASSIC INSTITUTIONAL HERO (Only shown on home page) -->
                <section v-if="!showFullMart && activePage === 'home'" id="dashboard-hero"
                    class="space-y-12 md:space-y-16 relative pb-12 md:pb-16 overflow-hidden">
                    <!-- Subtle Institutional Background -->
                    <div class="absolute inset-0 opacity-[0.03] pointer-events-none z-0">
                        <div class="absolute inset-0"
                            style="background-image: radial-gradient(#3D6EB4 1px, transparent 1px); background-size: 32px 32px;">
                        </div>
                        <div class="absolute inset-0"
                            style="background-image: linear-gradient(to right, #3D6EB4 1px, transparent 1px), linear-gradient(to bottom, #3D6EB4 1px, transparent 1px); background-size: 128px 128px;">
                        </div>
                    </div>

                    <!-- 1. The Masthead -->
                    <div class="text-center space-y-6 md:space-y-8 max-w-4xl mx-auto pt-0 relative z-10">
                        <div class="flex items-center justify-center gap-3 md:gap-6 mb-3 md:mb-4">
                            <div class="h-px bg-navy/10 flex-1"></div>
                            <span
                                class="text-xs md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-brand">Est.
                                2024</span>
                            <div class="h-px bg-navy/10 flex-1"></div>
                        </div>

                        <div class="flex flex-col items-center gap-3 md:gap-4">
                            <!-- Institutional Trust Badge -->
                            <div class="reveal animate-fade-in flex flex-col items-center group cursor-default"
                                style="transition-delay: 200ms;">
                                <div class="flex gap-1.5 mb-2 md:mb-2">
                                    <i v-for="star in 5" :key="star"
                                        class="fas fa-star text-sm md:text-[10px] text-brand drop-shadow-[0_0_8px_rgba(189,157,114,0.4)] group-hover:scale-110 transition-transform duration-300"
                                        :style="{ transitionDelay: `${star * 50}ms` }"></i>
                                </div>
                                <span
                                    class="text-xs md:text-[9px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-navy/40 group-hover:text-brand transition-colors">Institutional
                                    Rating: 4.9/5.0</span>
                            </div>

                            <h1 class="flex flex-col items-center gap-2 md:gap-2">
                                <!-- Main Logo Branding (Matching Reference) -->
                                <div
                                    class="logo-branding-classic flex flex-col items-center select-none reveal animate-glide-up">
                                    <div class="text-[54px] sm:text-7xl md:text-7xl lg:text-[120px] font-black leading-none flex items-center tracking-tighter"
                                        style="font-family: 'Fredoka', 'Fredoka One', 'Varela Round', sans-serif;">
                                        <span
                                            class="text-[#3D6EB4] hover:scale-105 transition-transform duration-500 cursor-default"
                                            style="text-shadow: 0 0 0 white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white, -2px 0 0 white, 2px 0 0 white, 0 -2px 0 white, 0 2px 0 white;">Fair</span>
                                        <span
                                            class="text-[#EE3124] hover:scale-105 transition-transform duration-500 cursor-default"
                                            style="text-shadow: 0 0 0 white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white, -2px 0 0 white, 2px 0 0 white, 0 -2px 0 white, 0 2px 0 white;">mat</span>
                                    </div>
                                    <div class="text-lg sm:text-2xl md:text-2xl lg:text-[42px] font-black tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.2em] text-[#3D6EB4] uppercase mt-[-4px] sm:mt-[-8px] md:mt-[-10px] animate-tracking-in-expand"
                                        style="font-family: 'Michroma', sans-serif; text-shadow: -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white;">
                                        Supermarket Ltd
                                    </div>
                                </div>
                                <!-- Compact Slogan (Integrated closely to avoid overlap) -->
                                <div class="flex flex-wrap justify-center gap-x-3 md:gap-x-4 gap-y-1 mt-3 md:mt-4 relative z-50 reveal px-4"
                                    style="transition-delay: 400ms;">
                                    <span
                                        class="text-xs sm:text-base md:text-lg lg:text-xl font-black text-[#3D6EB4] hover:text-brand transition-colors duration-300"
                                        style="font-family: 'Fredoka', sans-serif; text-shadow: -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white;">
                                        QUALITY PRODUCTS
                                    </span>
                                    <span class="text-white/20 sm:inline hidden sm:block">•</span>
                                    <span
                                        class="text-xs sm:text-base md:text-lg lg:text-xl font-black text-[#3D6EB4] hover:text-brand transition-colors duration-300"
                                        style="font-family: 'Fredoka', sans-serif; text-shadow: -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white;">
                                        FAIR PRICES
                                    </span>
                                    <span class="text-white/20 sm:inline hidden sm:block">•</span>
                                    <span
                                        class="text-xs sm:text-base md:text-lg lg:text-xl font-black text-[#3D6EB4] hover:text-brand transition-colors duration-300"
                                        style="font-family: 'Fredoka', sans-serif; text-shadow: -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white;">
                                        FRIENDLY SERVICES
                                    </span>
                                </div>
                            </h1>

                            <!-- Primary CALL TO ACTION (Desktop Only) -->
                            <div class="hidden md:block mt-6 md:mt-8 reveal animate-fade-in-up"
                                style="transition-delay: 650ms;">
                                <button @click="scrollToSection('shop')"
                                    class="bg-brand text-white px-8 md:px-10 py-4 md:py-4.5 rounded-full font-black text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] hover:bg-navy transition-all shadow-[0_20px_50px_rgba(189,157,114,0.25)] hover:shadow-brand/20 flex items-center gap-4 md:gap-5 group/cta mx-auto border border-brand/20 group">
                                    <span class="relative z-10">Explore Selection</span>
                                    <i
                                        class="fas fa-arrow-down text-[8px] group-hover:translate-y-1 transition-transform duration-500"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 2. The Grand Signage & Dashboard Grid (Mobile: Stacked | Desktop: Grid) -->
                    <div
                        class="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-20 items-center py-6 md:py-12 relative border-t border-navy/5 px-6 md:px-0">

                        <!-- 1. Order Registry (Mobile: Top) -->
                        <div
                            class="w-full md:w-auto space-y-3 md:space-y-12 lg:pr-20 lg:border-r border-gray-100 order-1 md:order-none border-b md:border-0 border-navy/5 pb-4 md:pb-0">
                            <div class="space-y-1 md:space-y-3 animate-fade-in text-center md:text-left">
                                <!-- Mobile Header -->
                                <h4
                                    class="md:hidden text-2xl font-black uppercase tracking-tighter text-navy flex items-center justify-center gap-2">
                                    ORDER <span class="font-serif italic text-brand lowercase">registry</span>
                                </h4>
                                <!-- Desktop Header -->
                                <h4
                                    class="hidden md:block text-[8px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-brand">
                                    Registry
                                </h4>
                            </div>
                            <div class="flex justify-between md:flex-col gap-2 md:gap-8 px-1 md:px-0">
                                <div v-for="(step, idx) in [
                                    { name: 'Order Placed', time: '04:25 PM', active: false, color: 'bg-navy/20' },
                                    { name: 'In Progress', time: 'Live Now', active: true, color: 'bg-brand' },
                                    { name: 'Shipped', time: 'Pending', active: false, color: 'bg-gray-100' }
                                ]" :key="idx"
                                    :class="['flex flex-col md:flex-row items-center gap-1.5 md:gap-6 reveal animate-fade-in-up', !step.active && !step.color.includes('navy') ? 'opacity-30' : '']"
                                    :style="{ transitionDelay: `${idx * 150 + 400}ms` }">
                                    <div
                                        :class="['w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full', step.color, step.active ? 'animate-pulse' : '']">
                                    </div>
                                    <div
                                        class="flex-1 group/reg cursor-pointer text-center md:text-left hover:-translate-y-0.5 transition-transform duration-300">
                                        <p
                                            class="text-[7px] lg:text-[10px] font-black uppercase tracking-widest text-navy group-hover/reg:text-brand transition-colors leading-tight">
                                            {{ step.name }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 2. Center: Logo (Mobile: Middle) -->
                        <div class="relative flex items-center justify-center py-2 md:py-8 order-2 md:order-none">
                            <div
                                class="relative w-24 sm:max-w-xs md:w-full aspect-square flex items-center justify-center z-20">
                                <div class="w-full h-full flex items-center justify-center relative z-10 scale-100">
                                    <img :src="fairmatLogo" fetchpriority="high" loading="eager" decoding="async"
                                        class="w-full h-full object-contain mix-blend-multiply" alt="Fairmat Logo">
                                </div>
                            </div>
                        </div>

                        <!-- 3. Right: Aisles (Mobile: Bottom) -->
                        <div
                            class="w-full md:w-auto space-y-4 md:space-y-12 lg:pl-20 mt-2 md:mt-12 lg:mt-0 order-3 md:order-none">
                            <div class="space-y-1 md:space-y-3 animate-fade-in text-center md:text-left">
                                <!-- Mobile Header -->
                                <h4
                                    class="md:hidden text-2xl font-black uppercase tracking-tighter text-navy flex items-center justify-center gap-2">
                                    MAIN <span class="font-serif italic text-brand lowercase">aisles</span>
                                </h4>
                                <!-- Desktop Header -->
                                <h4
                                    class="hidden md:block text-[8px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-brand">
                                    Aisles
                                </h4>
                                <p
                                    class="text-[7px] md:text-[9px] text-navy/40 uppercase font-black tracking-widest hidden md:block">
                                    Registry
                                    Navigation
                                </p>
                            </div>

                            <!-- Mobile: Diamond Navigation -->
                            <div class="flex md:hidden flex-wrap justify-center gap-5 py-2 px-4">
                                <button v-for="(dept, idx) in ['Produce', 'Dairy', 'Bakery', 'Meats']" :key="dept"
                                    @click="scrollToSection('shop')"
                                    class="w-10 h-10 bg-surface border border-brand/20 rotate-45 flex items-center justify-center shadow-[0_2px_10px_rgba(189,157,114,0.1)] hover:bg-brand hover:border-brand hover:scale-110 transition-all duration-300 group">
                                    <span
                                        class="-rotate-45 text-[5px] font-black uppercase tracking-widest text-navy group-hover:text-white transition-colors">{{
                                            dept }}</span>
                                </button>
                            </div>

                            <!-- Mobile: Explore All CTA -->
                            <div class="md:hidden flex justify-center mt-4 pb-2">
                                <button @click="toggleMartView(true)"
                                    class="px-8 py-2.5 rounded-full border border-brand/40 bg-white/50 backdrop-blur-sm text-brand font-black text-[9px] uppercase tracking-[0.25em] shadow-lg hover:bg-brand hover:text-white transition-all duration-300 animate-pulse">
                                    Explore All
                                </button>
                            </div>

                            <!-- Desktop: List Navigation -->
                            <div class="hidden md:flex flex-col gap-4">
                                <button
                                    v-for="(dept, idx) in ['Fresh Produce', 'Dairy & Eggs', 'Artisanal Bakery', 'Meat & Fish', 'Electronics']"
                                    :key="dept" @click="scrollToSection('shop')"
                                    class="text-left py-3 px-4 lg:px-0 border-b border-gray-50 flex justify-between items-center group reveal animate-slide-in-right"
                                    :style="{ transitionDelay: `${idx * 100 + 500}ms` }">
                                    <span
                                        class="text-[10px] font-black uppercase tracking-widest text-navy group-hover:text-brand lg:group-hover:pl-4 transition-all duration-500 whitespace-nowrap">{{
                                            dept }}</span>
                                    <i
                                        class="fas fa-arrow-right text-[8px] opacity-0 lg:group-hover:opacity-100 lg:group-hover:translate-x-2 transition-all text-brand ml-2"></i>
                                </button>
                            </div>
                        </div>

                    </div>

                </section>



                <!-- PRODUCT LIST SECTION -->
                <section v-if="!showFullMart && activePage === 'home'" id="shop" class="pt-12 md:pt-20 relative px-6">
                    <div
                        class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 md:mb-12 gap-6">
                        <h2 class="text-3xl md:text-2xl font-black tracking-tight uppercase leading-none">Main <span
                                class="text-brand italic font-serif lowercase text-4xl md:text-4xl">Aisles</span></h2>
                        <div class="w-full h-px bg-sidebar/5 flex-1 mx-12 hidden md:block"></div>
                        <div class="flex gap-4">
                            <button @click="toggleMartView(true)"
                                class="px-6 md:px-6 py-3 md:py-2.5 rounded-full border-2 border-brand text-brand font-black text-xs md:text-[9px] uppercase tracking-widest hover:bg-brand hover:text-white transition">Explore
                                All</button>
                        </div>
                    </div>

                    <div class="relative group">
                        <!-- Navigation Arrows -->
                        <button @click="scrollCarousel(-1)"
                            class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 md:-translate-x-1/2 z-30 w-14 h-14 md:w-16 md:h-16 bg-white/90 backdrop-blur-xl rounded-full shadow-2xl flex items-center justify-center border border-gray-100 hover:bg-brand hover:text-white transition-all duration-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-hover:-translate-x-1/4">
                            <i class="fas fa-chevron-left text-sm md:text-base"></i>
                        </button>

                        <button @click="scrollCarousel(1)"
                            class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 md:translate-x-1/2 z-30 w-14 h-14 md:w-16 md:h-16 bg-white/90 backdrop-blur-xl rounded-full shadow-2xl flex items-center justify-center border border-gray-100 hover:bg-brand hover:text-white transition-all duration-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-hover:translate-x-1/4">
                            <i class="fas fa-chevron-right text-sm md:text-base"></i>
                        </button>

                        <div id="product-carousel"
                            class="flex gap-4 md:gap-8 lg:gap-12 overflow-x-auto snap-x snap-mandatory pb-8 md:pb-12 px-2">
                            <div class="carousel-item reveal group"
                                @click="openProductModal({ name: 'Heirloom Tomato', category: 'Fresh Produce', price: 350, img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Experience the peak of artisanal farming.' })">
                                <div
                                    class="aspect-square bg-surface rounded-3xl md:rounded-5xl overflow-hidden mb-4 md:mb-8 relative p-4 md:p-12">
                                    <img src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80&fm=webp"
                                        loading="lazy" decoding="async" @error="handleImageError"
                                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000">
                                    <button @click.stop="addToCart(350, 'Heirloom Tomato')"
                                        class="absolute bottom-8 right-8 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all hover:bg-brand hover:text-white">
                                        <i class="fas fa-cart-plus"></i>
                                    </button>
                                </div>
                                <div class="px-4 h-40 flex flex-col justify-between flex-grow">
                                    <h3 class="font-black text-2xl md:text-lg">Heirloom Tomato</h3>
                                    <p
                                        class="text-xs md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        Organic
                                        Farms
                                    </p>
                                    <span class="text-3xl md:text-xl font-serif italic text-navy/40 block mt-4">350<span
                                            class="text-xs md:text-[10px] uppercase font-sans not-italic ml-1 font-bold">KES</span></span>
                                </div>
                            </div>

                            <div class="carousel-item reveal group" style="transition-delay: 100ms;"
                                @click="openProductModal({ name: 'Morning Milk', category: 'Dairy', price: 180, img: 'https://images.unsplash.com/photo-1563636619-e910ef2a844b?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Fresh from the farm every morning.' })">
                                <div
                                    class="aspect-square bg-surface rounded-3xl md:rounded-5xl overflow-hidden mb-4 md:mb-8 relative p-4 md:p-12">
                                    <img src="https://images.unsplash.com/photo-1563636619-e910ef2a844b?auto=format&fit=crop&w=800&q=80&fm=webp"
                                        loading="lazy" decoding="async" @error="handleImageError"
                                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000">
                                    <button @click.stop="addToCart(180, 'Morning Milk')"
                                        class="absolute bottom-4 right-4 md:bottom-8 md:right-8 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-xl flex items-center justify-center transform translate-y-0 opacity-100 md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all hover:bg-brand hover:text-white z-20">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                                <div class="px-4 h-40 flex flex-col justify-between flex-grow">
                                    <h3 class="font-black text-2xl md:text-lg">Morning Milk</h3>
                                    <p
                                        class="text-xs md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        A-Grade
                                        Dairy
                                    </p>
                                    <span class="text-3xl md:text-xl font-serif italic text-navy/40 block mt-4">180<span
                                            class="text-xs md:text-[10px] uppercase font-sans not-italic ml-1 font-bold">KES</span></span>
                                </div>
                            </div>

                            <div class="carousel-item reveal group" style="transition-delay: 200ms;"
                                @click="openProductModal({ name: 'Artisanal Bread', category: 'Bakery', price: 420, img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Stone-oven baked bread.' })">
                                <div
                                    class="aspect-square bg-surface rounded-3xl md:rounded-5xl overflow-hidden mb-4 md:mb-8 relative p-4 md:p-12">
                                    <img src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80&fm=webp"
                                        loading="lazy" decoding="async" @error="handleImageError"
                                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000">
                                    <button @click.stop="addToCart(420, 'Artisanal Bread')"
                                        class="absolute bottom-4 right-4 md:bottom-8 md:right-8 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-xl flex items-center justify-center transform translate-y-0 opacity-100 md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all hover:bg-brand hover:text-white z-20">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                                <div class="px-4 h-40 flex flex-col justify-between flex-grow">
                                    <h3 class="font-black text-2xl md:text-lg">Artisanal Bread</h3>
                                    <p
                                        class="text-xs md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        Stone Oven
                                    </p>
                                    <span class="text-3xl md:text-xl font-serif italic text-navy/40 block mt-4">420<span
                                            class="text-xs md:text-[10px] uppercase font-sans not-italic ml-1 font-bold">KES</span></span>
                                </div>
                            </div>

                            <div class="carousel-item reveal group" style="transition-delay: 300ms;"
                                @click="openProductModal({ name: 'Fresh Avocado', category: 'Fresh Produce', price: 150, img: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Creamy highlands avocados.' })">
                                <div
                                    class="aspect-square bg-surface rounded-3xl md:rounded-5xl overflow-hidden mb-4 md:mb-8 relative p-4 md:p-12">
                                    <img src="https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80&fm=webp"
                                        loading="lazy" decoding="async" @error="handleImageError"
                                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000">
                                    <button @click.stop="addToCart(150, 'Fresh Avocado')"
                                        class="absolute bottom-4 right-4 md:bottom-8 md:right-8 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-xl flex items-center justify-center transform translate-y-0 opacity-100 md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all hover:bg-brand hover:text-white z-20">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                                <div class="px-4 h-40 flex flex-col justify-between flex-grow">
                                    <h3 class="font-black text-2xl md:text-lg">Fresh Avocado</h3>
                                    <p
                                        class="text-xs md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        Highland
                                        Origin
                                    </p>
                                    <span class="text-3xl md:text-xl font-serif italic text-navy/40 block mt-4">150<span
                                            class="text-xs md:text-[10px] uppercase font-sans not-italic ml-1 font-bold">KES</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Second Row: Daily Essentials -->
                    <div class="mt-12 md:mt-20">
                        <div
                            class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4 reveal">
                            <h2 class="text-4xl md:text-2xl font-black tracking-tight uppercase">Daily <span
                                    class="text-brand italic font-serif lowercase">Essentials</span></h2>
                            <div class="w-full h-px bg-sidebar/5 flex-1 mx-12 hidden md:block"></div>
                        </div>

                        <div class="relative group">
                            <!-- Navigation Arrows -->
                            <button @click="scrollCarousel(-1, 'essentials-carousel')"
                                class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 md:-translate-x-1/2 z-30 w-14 h-14 md:w-16 md:h-16 bg-white/90 backdrop-blur-xl rounded-full shadow-2xl flex items-center justify-center border border-gray-100 hover:bg-brand hover:text-white transition-all duration-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-hover:-translate-x-1/4">
                                <i class="fas fa-chevron-left text-sm md:text-base"></i>
                            </button>

                            <button @click="scrollCarousel(1, 'essentials-carousel')"
                                class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 md:translate-x-1/2 z-30 w-14 h-14 md:w-16 md:h-16 bg-white/90 backdrop-blur-xl rounded-full shadow-2xl flex items-center justify-center border border-gray-100 hover:bg-brand hover:text-white transition-all duration-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-hover:translate-x-1/4">
                                <i class="fas fa-chevron-right text-sm md:text-base"></i>
                            </button>

                            <div id="essentials-carousel"
                                class="flex gap-4 md:gap-8 lg:gap-12 overflow-x-auto snap-x snap-mandatory pb-8 md:pb-12 scrollbar-hide px-2">
                                <!-- Product Row 2 - 1 -->
                                <div class="carousel-item reveal group"
                                    @click="openProductModal({ name: 'Grass-fed Beef', category: 'Meats', price: 1200, img: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Premium highland beef, cut to perfection.' })">
                                    <div
                                        class="aspect-square bg-surface rounded-3xl md:rounded-5xl overflow-hidden mb-4 md:mb-8 relative p-4 md:p-12">
                                        <img src="https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=800&q=80&fm=webp"
                                            loading="lazy" decoding="async" @error="handleImageError"
                                            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000">
                                        <button @click.stop="addToCart(1200, 'Grass-fed Beef')"
                                            class="absolute bottom-4 right-4 md:bottom-8 md:right-8 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-xl flex items-center justify-center transform translate-y-0 opacity-100 md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all hover:bg-brand hover:text-white z-20">
                                            <i class="fas fa-plus"></i>
                                        </button>
                                    </div>
                                    <div class="px-4 h-40 flex flex-col justify-between flex-grow">
                                        <h3 class="font-black text-2xl md:text-lg">Grass-fed Beef</h3>
                                        <p
                                            class="text-xs md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            Highland Prime</p>
                                        <span
                                            class="text-3xl md:text-xl font-serif italic text-navy/40 block mt-4">1,200<span
                                                class="text-xs md:text-[10px] uppercase font-sans not-italic ml-1 font-bold">KES</span></span>
                                    </div>
                                </div>

                                <!-- Product Row 2 - 2 -->
                                <div class="carousel-item reveal group" style="transition-delay: 100ms;"
                                    @click="openProductModal({ name: 'Premium Coffee', category: 'Groceries', price: 950, img: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Single-origin roasted beans.' })">
                                    <div
                                        class="aspect-square bg-surface rounded-3xl md:rounded-5xl overflow-hidden mb-4 md:mb-8 relative p-4 md:p-12">
                                        <img src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80&fm=webp"
                                            loading="lazy" decoding="async" @error="handleImageError"
                                            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000">
                                        <button @click.stop="addToCart(950, 'Premium Coffee')"
                                            class="absolute bottom-4 right-4 md:bottom-8 md:right-8 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-xl flex items-center justify-center transform translate-y-0 opacity-100 md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all hover:bg-brand hover:text-white z-20">
                                            <i class="fas fa-plus"></i>
                                        </button>
                                    </div>
                                    <div class="px-4 h-40 flex flex-col justify-between flex-grow">
                                        <h3 class="font-black text-2xl md:text-lg">Premium Coffee</h3>
                                        <p
                                            class="text-xs md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            Roasted Arabica</p>
                                        <span
                                            class="text-3xl md:text-xl font-serif italic text-navy/40 block mt-4">950<span
                                                class="text-xs md:text-[10px] uppercase font-sans not-italic ml-1 font-bold">KES</span></span>
                                    </div>
                                </div>

                                <!-- Product Row 2 - 3 -->
                                <div class="carousel-item reveal group" style="transition-delay: 200ms;"
                                    @click="openProductModal({ name: 'Local Honey', category: 'Groceries', price: 600, img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Pure, unprocessed wild honey.' })">
                                    <div
                                        class="aspect-square bg-surface rounded-3xl md:rounded-5xl overflow-hidden mb-4 md:mb-8 relative p-4 md:p-12">
                                        <img src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80&fm=webp"
                                            loading="lazy" decoding="async" @error="handleImageError"
                                            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000">
                                        <button @click.stop="addToCart(600, 'Local Honey')"
                                            class="absolute bottom-4 right-4 md:bottom-8 md:right-8 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-xl flex items-center justify-center transform translate-y-0 opacity-100 md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all hover:bg-brand hover:text-white z-20">
                                            <i class="fas fa-plus"></i>
                                        </button>
                                    </div>
                                    <div class="px-4 h-40 flex flex-col justify-between flex-grow">
                                        <h3 class="font-black text-2xl md:text-lg">Local Honey</h3>
                                        <p
                                            class="text-xs md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            Wild
                                            Pure</p>
                                        <span
                                            class="text-3xl md:text-xl font-serif italic text-navy/40 block mt-4">600<span
                                                class="text-xs md:text-[10px] uppercase font-sans not-italic ml-1 font-bold">KES</span></span>
                                    </div>
                                </div>

                                <!-- Product Row 2 - 4 -->
                                <div class="carousel-item reveal group" style="transition-delay: 300ms;"
                                    @click="openProductModal({ name: 'Sea Salt', category: 'Essentials', price: 200, img: 'https://images.unsplash.com/photo-1610450949025-968600d8324e?auto=format&fit=crop&w=800&q=80&fm=webp', desc: 'Natural coastal sea salt.' })">
                                    <div
                                        class="aspect-square bg-surface rounded-3xl md:rounded-5xl overflow-hidden mb-4 md:mb-8 relative p-4 md:p-12">
                                        <img src="https://images.unsplash.com/photo-1610450949025-968600d8324e?auto=format&fit=crop&w=800&q=80&fm=webp"
                                            loading="lazy" decoding="async" @error="handleImageError"
                                            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000">
                                        <button @click.stop="addToCart(200, 'Sea Salt')"
                                            class="absolute bottom-4 right-4 md:bottom-8 md:right-8 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-xl flex items-center justify-center transform translate-y-0 opacity-100 md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all hover:bg-brand hover:text-white z-20">
                                            <i class="fas fa-plus"></i>
                                        </button>
                                    </div>
                                    <div class="px-4 h-40 flex flex-col justify-between flex-grow">
                                        <h3 class="font-black text-2xl md:text-lg">Sea Salt</h3>
                                        <p
                                            class="text-xs md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            Coastal Natural</p>
                                        <span
                                            class="text-3xl md:text-xl font-serif italic text-navy/40 block mt-4">200<span
                                                class="text-xs md:text-[10px] uppercase font-sans not-italic ml-1 font-bold">KES</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!--FULL MART VIEW(EXPANDED GRID)-->
                <section v-if="showFullMart && activePage === 'home'" id="full-mart-view"
                    class="min-h-screen pt-8 pb-32">
                    <div
                        class="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 gap-4 md:gap-8 reveal">
                        <div class="flex items-center gap-4 md:gap-8">
                            <button @click="toggleMartView(false)"
                                class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-surface border border-gray-100 flex items-center justify-center hover:bg-brand hover:text-white transition-all group shadow-sm">
                                <i
                                    class="fas fa-arrow-left text-sm md:text-base group-hover:-translate-x-1 transition-transform"></i>
                            </button>
                            <div>
                                <p
                                    class="text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] text-brand mb-1">
                                    Inventory
                                    Access
                                </p>
                                <h2
                                    class="text-4xl md:text-4xl lg:text-5xl font-black tracking-tighter text-navy uppercase leading-none">
                                    Global <span class="text-brand italic font-serif lowercase">Matrix</span></h2>
                            </div>
                        </div>
                    </div>

                    <!--INSTITUTIONAL PROMO HUB-->
                    <div class="mb-10 reveal relative group/promo">
                        <div
                            class="relative h-[280px] sm:h-[320px] md:h-[380px] rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-navy shadow-3xl">
                            <!-- Carousel Items -->
                            <div v-for="(promo, idx) in promos" :key="idx"
                                :class="['absolute inset-0 transition-all duration-[1500ms] ease-[cubic-bezier(0.23,1,0.32,1)]',
                                    currentPromoIdx === idx ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-110 translate-x-20 pointer-events-none']">

                                <img :src="promo.img + '&fm=webp'" loading="lazy" decoding="async"
                                    class="absolute inset-0 w-full h-full object-cover opacity-50 transition-transform duration-[4000ms]"
                                    :style="{ transform: currentPromoIdx === idx ? 'scale(1.1)' : 'scale(1)' }">
                                <div class="absolute inset-0 bg-gradient-to-r from-navy via-navy/60 to-transparent">
                                </div>

                                <div
                                    class="relative h-full flex flex-col justify-center p-6 sm:p-8 md:p-12 lg:p-20 max-w-2xl">
                                    <div class="flex items-center gap-3 md:gap-6 mb-4 md:mb-8">
                                        <span
                                            :class="[promo.color, 'text-white px-3 md:px-6 py-1.5 md:py-2 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] shadow-xl']">
                                            {{ promo.label }}
                                        </span>
                                        <span
                                            class="text-white/40 font-black text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] font-serif italic">
                                            {{ promo.badge }}
                                        </span>
                                    </div>
                                    <h3
                                        class="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white leading-none tracking-tighter mb-4 md:mb-8 uppercase">
                                        {{ promo.title }} <br>
                                        <span
                                            class="text-brand italic font-serif lowercase text-2xl sm:text-3xl md:text-4xl lg:text-6xl">{{
                                                promo.subtitle }}</span>
                                    </h3>
                                    <div class="flex gap-4">
                                        <button @click="toggleCart"
                                            class="bg-brand text-white px-10 py-5 rounded-full font-black text-[11px] uppercase tracking-[0.4em] hover:bg-white hover:text-navy transition shadow-2xl flex items-center gap-4 group/btn">
                                            Secure Access
                                            <div
                                                class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover/btn:bg-navy/10 transition-colors">
                                                <i class="fas fa-arrow-right text-[10px]"></i>
                                            </div>
                                        </button>
                                        <button
                                            class="text-white font-black text-[10px] uppercase tracking-[0.4em] bg-white/10 hover:bg-white/20 transition-all px-8 py-5 rounded-full backdrop-blur-md border border-white/5">
                                            Protocol Details
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Carousel Controls -->
                            <div
                                class="absolute bottom-4 md:bottom-10 right-4 md:right-10 flex items-center gap-3 md:gap-6 z-20">
                                <div class="flex gap-1.5 md:gap-2">
                                    <div v-for="(_, idx) in promos" :key="idx" @click="currentPromoIdx = idx"
                                        :class="['h-1 md:h-1.5 transition-all duration-500 rounded-full cursor-pointer', currentPromoIdx === idx ? 'w-8 md:w-12 bg-brand' : 'w-3 md:w-4 bg-white/20 hover:bg-white/40']">
                                    </div>
                                </div>
                                <div class="flex gap-4">
                                    <button @click="prevPromo"
                                        class="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-brand hover:border-brand transition-all backdrop-blur-sm">
                                        <i class="fas fa-chevron-left text-xs"></i>
                                    </button>
                                    <button @click="nextPromo"
                                        class="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-brand hover:border-brand transition-all backdrop-blur-sm">
                                        <i class="fas fa-chevron-right text-xs"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- TRUST STRIP -->
                    <div
                        class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-8 md:mt-12 px-4 md:px-8 mb-8 md:mb-12">
                        <div class="flex items-center gap-2 md:gap-4 opacity-40 hover:opacity-100 transition">
                            <i class="fas fa-shield-alt text-sm md:text-lg text-brand"></i>
                            <span
                                class="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-navy">Secure
                                Gateway</span>
                        </div>
                        <div class="flex items-center gap-2 md:gap-4 opacity-40 hover:opacity-100 transition">
                            <i class="fas fa-truck-moving text-sm md:text-lg text-brand"></i>
                            <span
                                class="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-navy">Express
                                Delivery</span>
                        </div>
                        <div class="flex items-center gap-2 md:gap-4 opacity-40 hover:opacity-100 transition">
                            <i class="fas fa-certificate text-sm md:text-lg text-brand"></i>
                            <span
                                class="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-navy">Genuine
                                Source</span>
                        </div>
                        <div class="flex items-center gap-2 md:gap-4 opacity-40 hover:opacity-100 transition">
                            <i class="fas fa-clock text-sm md:text-lg text-brand"></i>
                            <span class="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-navy">24/7
                                Support</span>
                        </div>
                    </div>

                    <!-- MEMBERSHIP PROTOCOL (STAIRWAY TO EXCELLENCE) - COMPACT TIMELINE -->
                    <div class="mt-12 md:mt-20 mb-12 md:mb-16 reveal max-w-5xl mx-auto px-4">
                        <div class="text-center mb-8 md:mb-12">
                            <span
                                class="text-[8px] md:text-[9px] font-black uppercase tracking-[0.6em] text-brand">Institutional
                                Access Registry</span>
                            <h2 class="text-2xl lg:text-3xl font-black text-navy uppercase mt-2">Protocol <span
                                    class="text-brand italic font-serif lowercase">Sequence</span></h2>
                        </div>

                        <div class="relative">
                            <!-- Horizontal Progress Track -->
                            <!-- Horizontal Progress Track -->
                            <div class="absolute top-6 md:top-8 left-10 right-10 h-1 bg-gray-100 rounded-full">
                                <div
                                    class="absolute inset-0 bg-gradient-to-r from-brand to-brand/30 w-3/4 rounded-full">
                                    <div
                                        class="absolute right-[25%] top-1/2 -translate-y-1/2 w-3 h-3 bg-brand rounded-full shadow-[0_0_15px_rgba(189,157,114,0.8)] animate-pulse">
                                    </div>
                                </div>
                            </div>

                            <div
                                class="flex flex-row overflow-x-auto md:overflow-visible snap-x snap-mandatory gap-4 md:gap-6 relative z-10 pb-4 scrollbar-hide">
                                <div v-for="(step, idx) in [
                                    { title: 'Registry', desc: 'Secure institutional spot.', icon: 'user', status: 'Verified' },
                                    { title: 'Audit', desc: 'Identity verification.', icon: 'shield-alt', status: 'Active' },
                                    { title: 'Issuance', desc: 'Royal Card delivery.', icon: 'id-card', status: 'In Progress' },
                                    { title: 'Accrual', desc: 'Automated point sync.', icon: 'chart-line', status: 'Pending' }
                                ]" :key="idx" @click="activeProtocolStep = idx"
                                    class="group flex flex-col items-center text-center cursor-pointer min-w-[100px] md:min-w-0 md:flex-1 snap-center">

                                    <!-- Node -->
                                    <div
                                        :class="['w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[1.75rem] flex items-center justify-center transition-all duration-500 mb-2 md:mb-6 relative shrink-0',
                                            idx <= 2 ? 'bg-navy text-white shadow-xl' : 'bg-white border border-gray-100 text-gray-300',
                                            activeProtocolStep === idx ? 'scale-110 -translate-y-1 md:-translate-y-2 ring-2 md:ring-4 ring-brand/10' : '']">
                                        <i :class="['fas fa-' + step.icon + ' text-sm md:text-xl transition-all duration-500',
                                        activeProtocolStep === idx ? 'scale-125 rotate-6' : '']"></i>

                                        <!-- Status Indicator -->
                                        <div v-if="idx <= 2" :class="['absolute -bottom-1 -right-1 w-4 h-4 md:w-6 md:h-6 rounded-full border-2 md:border-4 border-white flex items-center justify-center transition-all',
                                            activeProtocolStep === idx ? 'scale-125' : '',
                                            idx === 2 ? 'bg-brand' : 'bg-green-600']">
                                            <i
                                                :class="['fas text-[6px] md:text-[7px] text-white', idx === 2 ? 'fa-spinner animate-spin' : 'fa-check']"></i>
                                        </div>
                                    </div>

                                    <div
                                        :class="['px-0 md:px-2 transition-all duration-500', activeProtocolStep === idx ? 'opacity-100' : 'opacity-70']">
                                        <h4
                                            class="text-[8px] md:text-[10px] font-black text-navy uppercase tracking-[0.2em] mb-1 group-hover:text-brand transition-colors">
                                            {{ step.title }}</h4>
                                        <p
                                            class="text-[6px] md:text-[8px] text-gray-400 font-serif italic leading-tight">
                                            {{ step.desc }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- DYNAMIC PROTOCOL DATA CARD -->
                        <div
                            class="mt-4 md:mt-12 bg-surface/30 rounded-[2rem] p-4 md:p-8 border border-navy/5 reveal flex flex-col md:flex-row items-center gap-4 md:gap-8 relative overflow-hidden group/detail">
                            <div
                                class="absolute inset-0 bg-brand/5 translate-x-32 skew-x-12 group-hover/detail:translate-x-0 transition-transform duration-1000">
                            </div>
                            <div
                                class="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-navy flex items-center justify-center text-brand shrink-0 relative z-10">
                                <span class="text-base md:text-xl font-black">0{{ activeProtocolStep + 1 }}</span>
                            </div>
                            <div class="flex-1 text-center md:text-left relative z-10 px-0 md:px-4">
                                <p
                                    class="text-[6px] md:text-[8px] font-black uppercase tracking-[0.4em] text-brand mb-1 md:mb-2">
                                    Protocol
                                    Command Log</p>
                                <p
                                    class="text-[10px] md:text-sm font-serif italic text-navy/60 leading-relaxed max-w-xl">
                                    "{{ protocolLogs[activeProtocolStep] }}"
                                </p>
                            </div>
                            <div class="hidden md:flex flex-col items-end gap-1 relative z-10">
                                <span class="text-[8px] font-black text-gray-300 uppercase tracking-widest">Registry
                                    ID</span>
                                <span class="text-[10px] font-mono font-black text-navy opacity-30">#FM-{{ 942 +
                                    activeProtocolStep }}-S</span>
                            </div>
                        </div>
                    </div>

                    <!--SEARCH & DISCOVERY NEXUS-->
                    <div id="discovery-nexus"
                        class="mt-12 md:mt-24 mb-8 md:mb-16 reveal border-t border-navy/5 pt-12 md:pt-24 px-4">
                        <div class="max-w-6xl mx-auto space-y-8 md:space-y-12">
                            <div class="text-center space-y-4">
                                <span
                                    class="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-brand">Institutional
                                    Inventory Control</span>
                                <h2
                                    class="text-3xl md:text-5xl lg:text-[54px] font-black text-navy uppercase leading-[0.8] md:leading-[0.9] tracking-tighter text-center">
                                    Main <br><span
                                        class="text-brand italic font-serif lowercase text-4xl md:text-7xl">Aisles</span>
                                </h2>
                            </div>

                            <!-- Search Interface -->
                            <div class="relative group/search max-w-3xl mx-auto">
                                <i
                                    class="fas fa-search absolute left-8 top-1/2 -translate-y-1/2 text-navy/30 group-focus-within/search:text-brand transition-colors text-xl"></i>
                                <input type="text" :value="searchQuery" @input="(e) => searchProducts(e.target.value)"
                                    placeholder="Query institutional ledger..."
                                    class="w-full bg-surface border-2 border-navy/5 rounded-[2.5rem] py-6 md:py-8 pl-16 md:pl-24 pr-8 text-base md:text-lg font-bold tracking-widest placeholder:text-navy/20 focus:outline-none focus:border-brand focus:ring-[12px] focus:ring-brand/5 transition-all shadow-2xl">

                                <!-- Active Search Badge -->
                                <div v-if="searchQuery"
                                    class="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                    <span class="text-[9px] font-black uppercase text-brand tracking-widest">Tracking
                                        matches</span>
                                    <button @click="searchProducts('')"
                                        class="w-6 h-6 rounded-full bg-brand/10 text-brand flex items-center justify-center hover:bg-brand hover:text-white transition-all">
                                        <i class="fas fa-times text-[8px]"></i>
                                    </button>
                                </div>
                            </div>

                            <!-- Refined Category Matrix -->
                            <div class="flex flex-wrap gap-4 justify-center items-center">
                                <button v-for="cat in [{ id: 'all', name: 'Full Archive' }, ...categories]"
                                    :key="cat.id" @click="filterProducts(cat.id)"
                                    :class="['group relative px-8 py-5 rounded-3xl border-2 transition-all duration-500 overflow-hidden flex items-center gap-4',
                                        activeFilter === cat.id ? 'bg-navy border-navy text-white shadow-2xl scale-105' : 'bg-white border-navy/5 text-navy hover:border-navy cursor-pointer']">

                                    <span class="text-[11px] font-black uppercase tracking-[0.2em] relative z-10">{{
                                        cat.name }}</span>

                                    <!-- Dynamic Count Badge -->
                                    <span
                                        :class="['text-[9px] font-bold px-3 py-1 rounded-full relative z-10 transition-colors',
                                            activeFilter === cat.id ? 'bg-brand text-white' : 'bg-gray-50 text-navy/30 group-hover:bg-brand group-hover:text-white']">
                                        {{allProducts.filter(p => (cat.id === 'all' || p.category ===
                                            cat.id)).length
                                        }}
                                    </span>

                                    <!-- Active Glow Decor -->
                                    <div v-if="activeFilter === cat.id"
                                        class="absolute bottom-0 left-0 right-0 h-1 bg-brand">
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!--PRODUCT CATALOG MAP-->
                    <!--Categorical Rows are rendered here-->

                    <div v-for="group in matrixData" :key="group.id" class="mb-24 category-row reveal">
                        <div class="flex items-center justify-between mb-10">
                            <div class="flex items-center gap-6">
                                <h4 class="text-3xl font-cursive text-brand">{{ group.name }}</h4>
                                <div class="h-px bg-gray-100 w-32 hidden md:block"></div>
                            </div>
                            <div class="flex gap-4">
                                <button @click="(e) => scrollRow(e, -1)"
                                    class="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-brand hover:text-white transition text-gray-400">
                                    <i class="fas fa-chevron-left text-xs"></i>
                                </button>
                                <button @click="(e) => scrollRow(e, 1)"
                                    class="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-brand hover:text-white transition text-gray-400">
                                    <i class="fas fa-chevron-right text-xs"></i>
                                </button>
                            </div>
                        </div>

                        <div
                            class="category-carousel-container flex gap-8 overflow-x-auto snap-x snap-mandatory pb-12 scrollbar-hide">
                            <div v-for="product in group.items" :key="product.name" @click="openProductModal(product)"
                                class="min-w-[70vw] sm:min-w-[280px] group cursor-pointer snap-start">
                                <div
                                    class="bg-surface rounded-4xl p-4 md:p-8 mb-4 md:mb-6 relative overflow-hidden aspect-square flex items-center justify-center transition-all duration-500 group-hover:shadow-xl">
                                    <img :src="product.img" loading="lazy" decoding="async" @error="handleImageError"
                                        class="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-700">
                                    <button @click.stop="addToCart(product.price, product.name)"
                                        class="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-brand transition-all duration-300 hover:bg-brand hover:text-white z-20">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                                <h5 class="font-black text-navy text-lg mb-1">{{ product.name }}</h5>
                                <p class="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">{{
                                    product.desc }}</p>
                                <span class="font-serif italic text-navy/40 text-base md:text-lg">{{ product.price
                                }}<span class="text-[8px] font-sans not-italic ml-1 font-bold">KES</span></span>
                            </div>
                        </div>
                    </div>


                    <!-- INSTITUTIONAL LEADERBOARD (MOST BOUGHT) - REGISTRY ROW -->
                    <div class="mt-40 mb-20 reveal py-24 relative group/board">
                        <!-- Background Accents -->
                        <div
                            class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-navy/5 to-transparent">
                        </div>
                        <div
                            class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-navy/5 to-transparent">
                        </div>

                        <div class="max-w-[1400px] mx-auto px-6">
                            <!-- Header -->
                            <div class="flex flex-col lg:flex-row items-end justify-between mb-20 gap-8">
                                <div class="text-center lg:text-left">
                                    <span
                                        class="text-[10px] font-black uppercase tracking-[0.6em] text-brand">Institutional
                                        Registry</span>
                                    <h2
                                        class="text-3xl md:text-5xl lg:text-[54px] font-black text-white/90 uppercase leading-[0.8] md:leading-[0.9] tracking-tighter text-center">
                                        High-Demand <br><span
                                            class="text-brand italic font-serif lowercase text-4xl md:text-7xl">Essentials</span>
                                    </h2>
                                    <div class="h-px bg-white/10 flex-1 hidden md:block"></div>
                                </div>
                                <div class="lg:max-w-xs text-right hidden lg:block">
                                    <p class="text-gray-400 font-serif italic text-lg leading-relaxed">
                                        Real-time tracking of artisanal asset acquisitions within the Fairmat Global
                                        Network.
                                    </p>
                                </div>
                            </div>

                            <!-- Registry Row (4-Column Grid / Mobile Scroll) -->
                            <div
                                class="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-4 border-t border-navy/5 pb-8 md:pb-0 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
                                <div v-for="(product, idx) in mostBought" :key="idx"
                                    class="min-w-[70vw] md:min-w-0 snap-center group/item relative border-r border-navy/5 last:border-r-0 md:border-b-0 md:border-r md:last:border-r-0 p-5 md:p-12 hover:bg-surface transition-all duration-1000 flex flex-col justify-between h-auto">

                                    <!-- Blueprint Decorative Elements -->
                                    <div
                                        class="absolute top-0 right-0 w-8 h-8 border-t border-r border-navy/5 opacity-0 group-hover/item:opacity-100 transition-opacity hidden md:block">
                                    </div>
                                    <div
                                        class="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-navy/5 opacity-0 group-hover/item:opacity-100 transition-opacity hidden md:block">
                                    </div>

                                    <!-- Rank & Protocol ID -->
                                    <div class="flex justify-between items-start mb-12">
                                        <div class="flex flex-col">
                                            <span
                                                class="text-[8px] font-black uppercase tracking-widest text-brand mb-1">Rank</span>
                                            <span
                                                class="text-3xl font-black text-navy/10 group-hover/item:text-brand transition-colors">0{{
                                                    idx + 1 }}</span>
                                        </div>
                                        <span
                                            class="text-[8px] font-mono font-black text-gray-300 uppercase vertical-text tracking-widest">#FM-{{
                                                1042 + idx }}-X</span>
                                    </div>

                                    <!-- Visual Asset Container -->
                                    <div class="relative aspect-square mb-6 md:mb-12 flex items-center justify-center">
                                        <div
                                            class="absolute inset-0 bg-brand/5 rounded-full scale-50 opacity-0 group-hover/item:scale-110 group-hover/item:opacity-100 transition-all duration-1000 blur-2xl">
                                        </div>
                                        <img :src="product.img" loading="lazy" decoding="async"
                                            @error="handleImageError"
                                            class="w-full h-32 md:h-48 object-contain drop-shadow-3xl transform group-hover/item:scale-110 group-hover/item:-rotate-3 transition-transform duration-1000 relative z-10">
                                    </div>

                                    <!-- Asset Metadata -->
                                    <div class="space-y-4 md:space-y-6">
                                        <div>
                                            <h4
                                                class="text-lg md:text-xl font-black text-navy uppercase tracking-tighter mb-1 line-clamp-1">
                                                {{ product.name }}</h4>
                                            <p class="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400">
                                                {{
                                                    product.desc }}</p>
                                        </div>

                                        <!-- Add Button Overlay -->
                                        <button @click.stop="addToCart(product.price, product.name)"
                                            class="absolute top-0 right-0 md:top-auto md:bottom-24 md:left-0 w-8 h-8 md:w-10 md:h-10 rounded-full border border-navy/10 flex items-center justify-center text-brand hover:bg-brand hover:text-white hover:border-brand transition-all shadow-sm z-20 bg-white/50 backdrop-blur-sm">
                                            <i class="fas fa-plus text-xs md:text-sm"></i>
                                        </button>

                                        <div class="pt-6 border-t border-navy/5 flex items-end justify-between">
                                            <div>
                                                <p
                                                    class="text-[8px] font-black uppercase tracking-widest text-gray-300 mb-2">
                                                    Institutional Value</p>
                                                <p class="text-2xl font-mono font-black text-navy tracking-tighter">
                                                    {{
                                                        product.price }} <span class="text-[10px] font-sans">KES</span>
                                                </p>
                                            </div>
                                            <div class="text-right">
                                                <p
                                                    class="text-[8px] font-black uppercase tracking-widest text-gray-300 mb-2">
                                                    Transfers</p>
                                                <p class="text-xl font-mono font-black text-brand tracking-tighter">
                                                    {{
                                                        product.sold }}+</p>
                                            </div>
                                        </div>

                                        <!-- Acquisition Control -->
                                        <div class="pt-8 flex gap-3">
                                            <button @click="addToCart(product.price, product.name)"
                                                class="flex-1 bg-navy text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-brand transition-all shadow-xl hover:shadow-brand/20">
                                                Acquire Asset
                                            </button>
                                            <button @click="openProductModal(product)"
                                                class="w-14 h-14 rounded-xl border border-navy/5 flex items-center justify-center text-navy/30 hover:text-brand hover:bg-surface transition-all">
                                                <i class="fas fa-expand-alt"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </section>

                <!-- PREMIUM PRODUCE BANNERS -->
                <section v-if="!showFullMart && activePage === 'home'" id="premium-offers"
                    class="mt-20 md:mt-32 mb-20 reveal">
                    <div class="grid md:grid-cols-2 gap-6 md:gap-8">
                        <!-- Fresh Vegetables Banner -->
                        <div
                            class="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-navy group cursor-pointer hover:shadow-2xl transition-all duration-700">
                            <!-- Background Pattern -->
                            <div class="absolute inset-0 opacity-5">
                                <svg class="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                                    <path fill="currentColor" class="text-white"
                                        d="M45.3,-57.5C58.9,-48.3,70.5,-33.9,75.4,-17.1C80.3,-0.3,78.5,18.9,70.1,34.4C61.7,49.9,46.7,61.7,30.1,67.8C13.5,73.9,-4.7,74.3,-21.6,68.9C-38.5,63.5,-54.1,52.3,-63.8,37.1C-73.5,21.9,-77.3,2.7,-74.6,-15.3C-71.9,-33.3,-62.7,-50.1,-48.9,-59.2C-35.1,-68.3,-17.5,-69.7,-0.3,-69.3C16.9,-68.9,31.7,-66.7,45.3,-57.5Z"
                                        transform="translate(100 100)" />
                                </svg>
                            </div>

                            <div class="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
                                <!-- Left: Content -->
                                <div class="flex-1 space-y-6">
                                    <div>
                                        <span
                                            class="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-brand block mb-3">Premium</span>
                                        <h3
                                            class="text-3xl md:text-4xl font-black text-white uppercase leading-none tracking-tighter mb-4">
                                            Fresh <br>
                                            <span
                                                class="text-brand italic font-serif lowercase text-4xl md:text-5xl">Vegetables</span>
                                        </h3>
                                        <p class="text-white/60 font-serif italic text-sm md:text-base mb-6">
                                            Get Extra 50% Off
                                        </p>
                                    </div>
                                    <button @click="toggleMartView(true)"
                                        class="bg-brand text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white hover:text-navy transition-all shadow-xl flex items-center gap-3 group/btn">
                                        Shop Now
                                        <i
                                            class="fas fa-arrow-right text-[8px] group-hover/btn:translate-x-1 transition-transform"></i>
                                    </button>
                                </div>

                                <!-- Right: Visual -->
                                <div class="w-full md:w-1/2 aspect-square md:aspect-auto md:h-48 relative">
                                    <div
                                        class="absolute inset-0 bg-gradient-to-br from-brand/10 to-transparent rounded-2xl">
                                    </div>
                                    <img src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80&fm=webp"
                                        loading="lazy" decoding="async"
                                        class="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
                                        alt="Fresh Vegetables">
                                </div>
                            </div>
                        </div>

                        <!-- Natural Fruits Banner -->
                        <div
                            class="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-surface group cursor-pointer hover:shadow-2xl transition-all duration-700 border border-navy/5">
                            <!-- Background Pattern -->
                            <div class="absolute inset-0 opacity-[0.02]">
                                <svg class="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                                    <path fill="currentColor" class="text-navy"
                                        d="M39.5,-65.3C51.4,-58.1,61.5,-47.3,68.8,-34.4C76.1,-21.5,80.6,-6.5,79.8,8.1C79,22.7,73,36.9,63.8,48.3C54.6,59.7,42.2,68.3,28.5,72.4C14.8,76.5,-0.2,76.1,-14.8,72.3C-29.4,68.5,-43.6,61.3,-54.5,50.4C-65.4,39.5,-73,24.9,-75.3,9.4C-77.6,-6.1,-74.6,-22.5,-66.8,-36.2C-59,-49.9,-46.4,-60.9,-32.8,-67.3C-19.2,-73.7,-4.6,-75.5,8.7,-72.8C22,-70.1,27.6,-72.5,39.5,-65.3Z"
                                        transform="translate(100 100)" />
                                </svg>
                            </div>

                            <div class="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
                                <!-- Left: Visual -->
                                <div
                                    class="w-full md:w-1/2 aspect-square md:aspect-auto md:h-48 relative order-2 md:order-1">
                                    <div
                                        class="absolute inset-0 bg-gradient-to-br from-navy/5 to-transparent rounded-2xl">
                                    </div>
                                    <img src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80&fm=webp"
                                        loading="lazy" decoding="async"
                                        class="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
                                        alt="Natural Fruits">
                                </div>

                                <!-- Right: Content -->
                                <div class="flex-1 space-y-6 order-1 md:order-2">
                                    <div>
                                        <span
                                            class="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-brand block mb-3">Available</span>
                                        <h3
                                            class="text-3xl md:text-4xl font-black text-navy uppercase leading-none tracking-tighter mb-4">
                                            100% Natural <br>
                                            <span
                                                class="text-brand italic font-serif lowercase text-4xl md:text-5xl">Fruits</span>
                                        </h3>
                                        <p class="text-navy/60 font-serif italic text-sm md:text-base mb-6">
                                            Weekend Special
                                        </p>
                                    </div>
                                    <button @click="toggleMartView(true)"
                                        class="bg-navy text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.3em] hover:bg-brand transition-all shadow-xl flex items-center gap-3 group/btn">
                                        Shop Now
                                        <i
                                            class="fas fa-arrow-right text-[8px] group-hover/btn:translate-x-1 transition-transform"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- INSTITUTIONAL ABOUT / MISSION (Compact Relocated Version) -->
                <section v-if="!showFullMart && activePage === 'home'" id="about-heritage" class="mt-20 md:mt-32 mb-20">
                    <div class="max-w-6xl mx-auto px-4 md:px-6">
                        <div class="group/about">
                            <div class="flex flex-col lg:flex-row gap-16 items-center">
                                <!-- Left: Visual Heritage (Scaled) -->
                                <div class="lg:w-2/5 relative">
                                    <div class="relative rounded-[2.5rem] overflow-hidden aspect-square shadow-xl">
                                        <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
                                            class="w-full h-full object-cover group-hover/about:scale-105 transition-transform duration-1000"
                                            alt="Fairmat Heritage">
                                    </div>
                                    <!-- Decorative Badge (Shrunk) -->
                                    <div
                                        class="absolute -top-6 -left-6 w-20 h-20 bg-brand rounded-full flex items-center justify-center animate-spin-slow shadow-lg z-20">
                                        <span
                                            class="text-[6px] font-black text-white text-center leading-tight uppercase tracking-widest p-4">Heritage
                                            <br> Level <br> Verified</span>
                                    </div>
                                </div>

                                <!-- Right: Narrative Content (High Density) -->
                                <div class="lg:w-3/5 space-y-8">
                                    <div class="reveal animate-fade-in-up">
                                        <span
                                            class="text-xs md:text-[8px] font-black uppercase tracking-[0.6em] text-brand block mb-4">Pedigree
                                            Registry</span>
                                        <h2
                                            class="text-4xl lg:text-4xl font-black text-navy uppercase leading-none tracking-tighter">
                                            Institutional <span
                                                class="text-brand italic font-serif lowercase text-5xl lg:text-5xl">Quality</span>
                                        </h2>
                                    </div>

                                    <p
                                        class="text-lg md:text-sm text-gray-500 leading-relaxed font-serif italic border-l-2 border-brand/20 pl-6">
                                        "Our mandate is the democratization of premium procurement, bridges the
                                        artisanal yields of Kenya to elite citizenry."
                                    </p>

                                    <div class="flex flex-wrap gap-4 reveal animate-fade-in-up"
                                        style="transition-delay: 200ms;">
                                        <div v-for="tag in ['Sustainably Sourced', 'Artisanal Selection']" :key="tag"
                                            class="px-4 py-2 rounded-full border border-navy/5 bg-white flex items-center gap-2">
                                            <i class="fas fa-check text-[8px] text-brand"></i>
                                            <span class="text-[8px] font-black uppercase tracking-widest">{{ tag
                                            }}</span>
                                        </div>
                                    </div>

                                    <div class="pt-4">
                                        <button @click="navigateToPage('about')"
                                            class="text-xs font-black uppercase tracking-[0.4em] text-brand border-b-2 border-brand/20 pb-2 hover:border-brand transition-all">
                                            Read Heritage Ledger
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>












                <!-- TESTIMONIALS MERGE (ELITE ENDORSEMENTS) -->
                <div v-if="activePage === 'home'" class="mt-12 md:mt-24 mb-12 md:mb-24 reveal px-6">
                    <div class="max-w-[1600px] mx-auto">
                        <div class="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
                            <div class="w-full lg:w-1/4 space-y-6">
                                <span
                                    class="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-brand block">Endorsement
                                    Loop</span>
                                <h2
                                    class="text-3xl md:text-5xl lg:text-6xl font-black text-navy uppercase leading-[0.85] md:leading-[0.9] tracking-tighter">
                                    Registry <br><span
                                        class="text-brand italic font-serif lowercase text-4xl md:text-6xl">Feedback</span>
                                </h2>
                                <div class="p-6 md:p-8 bg-brand/5 border-l-4 border-brand rounded-r-3xl">
                                    <p
                                        class="text-[9px] md:text-[11px] font-mono text-navy/60 leading-relaxed uppercase tracking-tighter">
                                        Verification Phase: 1.4s <br>
                                        Integrity Status: 100% Verified <br>
                                        Total Endorsements: 4,281
                                    </p>
                                </div>
                            </div>

                            <div class="w-full lg:w-3/4 overflow-hidden -mx-6 px-6 md:mx-0 md:px-0">
                                <div
                                    class="flex md:grid md:grid-cols-3 gap-6 md:gap-8 overflow-x-auto md:overflow-visible pb-12 md:pb-0 snap-x snap-mandatory scrollbar-hide">
                                    <div v-for="(t, idx) in testimonials" :key="idx"
                                        class="min-w-[80vw] md:min-w-0 snap-center relative p-5 md:p-10 bg-white border border-navy/5 rounded-[2rem] md:rounded-[3rem] hover:shadow-3xl transition-all duration-700 group/testi overflow-hidden"
                                        :class="idx === 1 ? 'md:-translate-y-12 bg-navy text-white' : ''">

                                        <!-- Watermark Background -->
                                        <div
                                            class="absolute -bottom-10 -right-4 opacity-[0.03] group-hover/testi:opacity-10 transition-opacity">
                                            <i class="fas fa-quote-right text-[6rem] md:text-[12rem]"></i>
                                        </div>

                                        <div class="relative z-10">
                                            <div class="flex items-center gap-3 mb-5 md:mb-8">
                                                <img :src="t.avatar + '&fm=webp'" loading="lazy" decoding="async"
                                                    class="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl object-cover grayscale group-hover/testi:grayscale-0 transition-all border border-navy/10">
                                                <div>
                                                    <h4 class="text-[9px] md:text-[11px] font-black uppercase tracking-widest leading-none"
                                                        :class="idx === 1 ? 'text-white' : 'text-navy'">{{ t.name }}
                                                    </h4>
                                                    <p
                                                        class="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-brand mt-1 opacity-80">
                                                        {{ t.role }}</p>
                                                </div>
                                            </div>

                                            <p class="text-sm md:text-lg font-serif italic mb-6 md:mb-10 leading-relaxed md:leading-snug"
                                                :class="idx === 1 ? 'text-white/80' : 'text-navy/70'">
                                                "{{ t.quote }}"
                                            </p>

                                            <div class="flex justify-between items-end border-t border-navy/5 pt-5 md:pt-8"
                                                :class="idx === 1 ? 'border-white/10' : ''">
                                                <div>
                                                    <span
                                                        class="text-[7px] md:text-[8px] font-black uppercase tracking-widest block mb-1 opacity-30">Location</span>
                                                    <span
                                                        class="text-[9px] md:text-[10px] font-black uppercase tracking-tighter">{{
                                                            t.location
                                                        }}</span>
                                                </div>
                                                <span class="text-[7px] md:text-[8px] font-mono font-black opacity-20 group-hover/testi:opacity-50
                                         transition-opacity">{{
                                            t.id }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>



                <!-- INSTITUTIONAL FAQ -->
                <section v-if="!showFullMart && activePage === 'home'" id="faq" class="mt-20 reveal">
                    <div class="bg-navy rounded-[2.5rem] p-8 lg:p-14 relative overflow-hidden group">
                        <!-- Abstract Background Shapes -->
                        <div
                            class="absolute -bottom-10 -right-4 opacity-[0.03] group-hover/testi:opacity-10 transition-opacity">
                            <i class="fas fa-quote-right text-[12rem]"></i>
                        </div>
                        <div
                            class="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-white/5 rounded-full blur-[60px]">
                        </div>

                        <div class="relative z-10 flex flex-col lg:flex-row gap-12">
                            <div class="lg:w-1/3">
                                <h2 class="text-2xl font-black text-white uppercase leading-none tracking-tighter">
                                    Service <br><span
                                        class="text-brand italic font-serif lowercase text-3xl">Queries</span>
                                </h2>
                                <p class="mt-4 text-white/40 font-serif italic text-base pr-4">
                                    Immediate resolutions for our refined clientele.
                                </p>
                                <button
                                    class="mt-8 text-[9px] font-black uppercase tracking-widest text-brand border-b border-brand pb-1 hover:text-white hover:border-white transition-all">Request
                                    Consultation</button>
                            </div>
                            <div class="lg:w-2/3 space-y-8">
                                <div v-for="(q, idx) in [
                                    { a: 'How do I initiate an institutional order?', b: 'Simply select your items and proceed to the trolley. For corporate bulk orders, reach out to our Nexus desk.' },
                                    { a: 'What are your primary fulfillment hours?', b: 'We operate 24/7 across our digital platforms, with physical mart fulfillment from 06:00 AM to 11:00 PM.' },
                                    { a: 'Do you offer nationwide courier services?', b: 'Yes, Fairmat Logistics covers all 47 counties with refrigerated and secure transport solutions.' }
                                ]" :key="idx" class="group/item">
                                    <h4
                                        class="text-sm font-black text-white uppercase tracking-wide mb-3 flex items-center gap-4 group-hover/item:translate-x-2 transition-transform duration-500">
                                        <span class="text-brand font-serif italic text-xl">?</span> {{ q.a }}
                                    </h4>
                                    <p
                                        class="text-white/50 font-serif italic text-sm leading-relaxed pl-6 border-l border-white/10 group-hover/item:border-brand transition-colors">
                                        {{ q.b }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- OUR HUBS (LOCATION & CONTACT) -->
                <section v-if="!showFullMart && activePage === 'home'" id="nexus"
                    class="mt-12 md:mt-24 mb-8 md:mb-12 reveal">
                    <div class="flex items-center gap-4 md:gap-8 mb-8 md:mb-16">
                        <h2 class="text-3xl md:text-4xl font-black text-navy uppercase leading-none tracking-tighter">
                            Our <span class="text-brand italic font-serif lowercase text-4xl md:text-5xl">Hubs</span>
                        </h2>
                        <div class="h-px bg-navy/10 flex-1 hidden md:block"></div>
                    </div>

                    <div class="flex flex-col lg:flex-row gap-12 items-stretch">
                        <!-- Left: HQ Card -->
                        <div
                            class="lg:w-1/3 bg-[#E8EDF5] rounded-[3rem] p-12 flex flex-col justify-center relative overflow-hidden group/hq shadow-xl">
                            <!-- Floating Icon -->
                            <div
                                class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-8 relative z-10">
                                <i class="fas fa-location-dot text-brand text-2xl"></i>
                            </div>

                            <div class="relative z-10 space-y-6">
                                <h3 class="text-3xl font-black text-navy uppercase tracking-tighter">Upperhill HQ
                                </h3>
                                <div class="space-y-1">
                                    <p class="text-navy/50 font-serif italic text-lg">Fairmat Tower, 12th Floor</p>
                                    <p class="text-navy/50 font-serif italic text-lg">Nairobi, Kenya</p>
                                </div>
                                <div class="pt-6">
                                    <span class="text-[10px] font-black uppercase tracking-[0.3em] text-[#EE3124]">Open
                                        24/7</span>
                                </div>
                            </div>

                            <!-- Decorative Ghost Pattern -->
                            <div
                                class="absolute -bottom-10 -right-10 text-navy/5 text-[12rem] rotate-12 pointer-events-none">
                                <i class="fas fa-building"></i>
                            </div>
                        </div>

                        <!-- Right: Interactive Map UI -->
                        <div class="lg:w-2/3 relative group/map overflow-hidden rounded-[3rem] shadow-2xl">
                            <div class="aspect-[21/9] lg:aspect-auto h-full min-h-[400px] bg-navy relative">
                                <!-- Dark Styled Map Image -->
                                <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1600&q=80&fm=webp"
                                    loading="lazy" decoding="async"
                                    class="absolute inset-0 w-full h-full object-cover opacity-30 grayscale contrast-125">

                                <div class="absolute inset-0 bg-navy/20"></div>

                                <!-- Simulated Map UI Overlay -->
                                <div
                                    class="absolute top-8 left-8 bg-black/80 backdrop-blur-md p-6 rounded-2xl border border-white/10 w-64 hidden md:block">
                                    <div class="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 class="text-white font-bold text-sm">Upper Hill</h4>
                                            <p class="text-white/40 text-[10px]">Nairobi</p>
                                        </div>
                                        <div class="text-right">
                                            <i class="fas fa-diamond-turn-right text-brand text-lg mb-1"></i>
                                            <p class="text-[8px] font-bold text-white/60 uppercase">Directions</p>
                                        </div>
                                    </div>
                                    <button
                                        class="text-[10px] text-brand border-b border-brand pb-1 font-bold hover:text-white hover:border-white transition-colors">View
                                        larger map</button>
                                </div>

                                <!-- Mobile Indicator -->
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <div
                                        class="w-12 h-12 bg-brand rounded-full flex items-center justify-center text-white animate-pulse shadow-[0_0_30px_rgba(189,157,114,0.5)]">
                                        <i class="fas fa-location-arrow text-xl"></i>
                                    </div>
                                </div>

                                <!-- UI Accents -->
                                <div class="absolute bottom-6 right-6 flex items-center gap-4">
                                    <div
                                        class="px-4 py-2 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 text-[8px] font-mono text-white/40 tracking-widest uppercase">
                                        Zoom: 14.5x
                                    </div>
                                    <div
                                        class="px-4 py-2 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 text-[8px] font-mono text-white/40 tracking-widest uppercase">
                                        -1.3006, 36.8172
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- FOOTER -->
                <footer class="mt-32 pb-20 relative overflow-hidden">
                    <!-- Background Watermark -->
                    <div
                        class="absolute -bottom-10 -right-20 text-[25vw] font-black text-brand/5 pointer-events-none select-none tracking-tighter uppercase leading-none z-0">
                        Fairmat
                    </div>

                    <div class="relative z-10">
                        <!-- Upper Footer: Columns -->
                        <div
                            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-16 lg:gap-32 mb-20 md:mb-40 border-t border-gray-100 pt-16 md:pt-32">
                            <!-- Column 1: Core Branding -->
                            <div class="space-y-6 md:space-y-10">
                                <div class="flex items-center gap-4">
                                    <div class="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
                                        <img :src="fairmatLogo" class="w-full h-full object-contain mix-blend-multiply">
                                    </div>
                                    <h3 class="text-lg md:text-xl font-black text-navy tracking-tight uppercase">
                                        Fairmat
                                        Mart
                                    </h3>
                                </div>
                                <p
                                    class="text-[12px] md:text-[13px] font-medium text-gray-400 max-w-sm leading-loose font-serif italic">
                                    Redefining the Kenyan retail landscape with global standards of institutional
                                    excellence and uncompromising quality.
                                </p>
                                <div class="flex gap-4">
                                    <a v-for="social in ['linkedin-in', 'instagram', 'twitter', 'facebook-f']"
                                        :key="social" href="#"
                                        class="w-10 h-10 rounded-full border border-navy/5 flex items-center justify-center text-navy/40 hover:bg-brand hover:text-white hover:border-brand transition-all duration-500">
                                        <i :class="'fab fa-' + social + ' text-xs'"></i>
                                    </a>
                                </div>
                            </div>

                            <!-- Column 2: Institutional -->
                            <div class="space-y-6 md:space-y-8">
                                <h4 class="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-brand">
                                    Institutional
                                </h4>
                                <ul class="space-y-4 md:space-y-5">
                                    <li>
                                        <a @click.prevent="navigateToPage('about')" href="#"
                                            class="text-sm md:text-[11px] font-black uppercase tracking-widest text-navy/60 hover:text-brand transition-colors cursor-pointer">About
                                            the Mart</a>
                                    </li>
                                    <li>
                                        <a @click.prevent="navigateToPage('global-inventory')" href="#"
                                            class="text-sm md:text-[11px] font-black uppercase tracking-widest text-navy/60 hover:text-brand transition-colors cursor-pointer">Global
                                            Inventory</a>
                                    </li>
                                    <li>
                                        <a @click.prevent="navigateToPage('procurement')" href="#"
                                            class="text-sm md:text-[11px] font-black uppercase tracking-widest text-navy/60 hover:text-brand transition-colors cursor-pointer">Procurement
                                            Registry</a>
                                    </li>
                                    <li>
                                        <a @click.prevent="navigateToPage('supply-chain')" href="#"
                                            class="text-sm md:text-[11px] font-black uppercase tracking-widest text-navy/60 hover:text-brand transition-colors cursor-pointer">Supply
                                            Chain</a>
                                    </li>
                                </ul>
                            </div>

                            <!-- Column 3: Logistics -->
                            <div class="space-y-6 md:space-y-8">
                                <h4 class="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-brand">
                                    Logistics
                                </h4>
                                <ul class="space-y-4 md:space-y-5">
                                    <li>
                                        <a @click.prevent="navigateToPage('shipping')" href="#"
                                            class="text-sm md:text-[11px] font-black uppercase tracking-widest text-navy/60 hover:text-brand transition-colors cursor-pointer">Shipping
                                            Protocol</a>
                                    </li>
                                    <li>
                                        <a @click.prevent="navigateToPage('returns')" href="#"
                                            class="text-sm md:text-[11px] font-black uppercase tracking-widest text-navy/60 hover:text-brand transition-colors cursor-pointer">Returns
                                            Registry</a>
                                    </li>
                                    <li>
                                        <a @click.prevent="navigateToPage('tracking')" href="#"
                                            class="text-sm md:text-[11px] font-black uppercase tracking-widest text-navy/60 hover:text-brand transition-colors cursor-pointer">Order
                                            Tracking</a>
                                    </li>
                                    <li>
                                        <a @click.prevent="navigateToPage('support')" href="#"
                                            class="text-sm md:text-[11px] font-black uppercase tracking-widest text-navy/60 hover:text-brand transition-colors cursor-pointer">Nexus
                                            Support</a>
                                    </li>
                                </ul>
                            </div>

                            <!-- Column 4: Protocol -->
                            <div class="space-y-6 md:space-y-8">
                                <h4 class="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-brand">
                                    Protocol
                                </h4>
                                <ul class="space-y-4 md:space-y-5">
                                    <li>
                                        <a @click.prevent="navigateToPage('privacy')" href="#"
                                            class="text-sm md:text-[11px] font-black uppercase tracking-widest text-navy/60 hover:text-brand transition-colors cursor-pointer">Privacy
                                            Charter</a>
                                    </li>
                                    <li>
                                        <a @click.prevent="navigateToPage('terms')" href="#"
                                            class="text-sm md:text-[11px] font-black uppercase tracking-widest text-navy/60 hover:text-brand transition-colors cursor-pointer">Terms
                                            of Service</a>
                                    </li>
                                    <li>
                                        <a @click.prevent="navigateToPage('ethics')" href="#"
                                            class="text-sm md:text-[11px] font-black uppercase tracking-widest text-navy/60 hover:text-brand transition-colors cursor-pointer">Member
                                            Ethics</a>
                                    </li>
                                    <li>
                                        <a @click.prevent="navigateToPage('compliance')" href="#"
                                            class="text-sm md:text-[11px] font-black uppercase tracking-widest text-navy/60 hover:text-brand transition-colors cursor-pointer">Compliance</a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <!-- Lower Footer: Bar -->
                        <div
                            class="flex flex-col md:flex-row justify-between items-center pt-8 md:pt-12 border-t border-gray-100 gap-6 md:gap-8 text-center md:text-left">
                            <div class="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                                <span
                                    class="text-xs md:text-[10px] font-black uppercase tracking-[0.5em] text-navy">EST.
                                    2024</span>
                                <div class="hidden md:block w-1 h-1 rounded-full bg-brand"></div>
                                <p class="text-xs md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Institutional
                                    Quality Guaranteed</p>
                            </div>
                            <p class="text-xs md:text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                                &copy; {{ new Date().getFullYear() }} Fairmat Supermarket LTD. All Rights Reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </main>

        <!--OVERLAYS -->
        <div v-if="isNavOpen" @click="toggleNav"
            class="fixed inset-0 bg-navy/10 z-[45] opacity-100 transition-opacity duration-700"></div>
        <div
            :class="['fixed left-4 top-4 w-16 bg-sidebar rounded-full z-[55] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col items-center py-8 overflow-hidden', isNavOpen ? 'h-[calc(100vh-32px)] opacity-100 translate-y-0' : '-translate-y-full opacity-0 pointer-events-none']">
            <button @click="toggleNav"
                class="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand transition-all duration-500 mb-8 shrink-0 group/exit">
                <i class="fas fa-times text-white text-[10px]"></i>
            </button>
            <nav class="flex-1 flex flex-col items-center justify-center space-y-12 w-full">
                <div class="w-24 h-24 flex items-center justify-center mb-8">
                    <img :src="fairmatLogo" class="w-full h-full object-contain mix-blend-multiply">
                </div>
                <a href="#" @click.prevent="goBackHome(); isNavOpen = false"
                    class="vertical-text text-[10px] font-black uppercase tracking-[0.4em] text-white hover:text-brand transition whitespace-nowrap">Dashboard</a>
                <a href="#" @click.prevent="goBackHome(); toggleMartView(true); isNavOpen = false"
                    class="vertical-text text-[10px] font-black uppercase tracking-[0.4em] text-white hover:text-brand transition whitespace-nowrap">
                    Inventory</a>
            </nav>
        </div>

        <!-- LOGIN MODAL -->
        <div v-if="isLoginOpen" @click="toggleLogin"
            class="fixed inset-0 bg-navy/40 backdrop-blur-xl z-[300] flex items-center justify-center p-6 md:p-12 transition-all duration-700">
            <div @click.stop
                class="bg-white w-full max-w-[500px] rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col p-8 sm:p-12 lg:p-16 transform-gpu reveal animate-glide-up">

                <!-- Close Button -->
                <button @click="toggleLogin"
                    class="absolute top-8 right-8 w-10 h-10 rounded-full bg-surface border border-navy/5 flex items-center justify-center hover:bg-brand hover:text-white transition-all">
                    <i class="fas fa-times text-xs"></i>
                </button>

                <div class="text-center space-y-8">
                    <div class="inline-flex items-center justify-center w-20 h-20 mb-4">
                        <img :src="fairmatLogo" class="w-12 h-12 object-contain mix-blend-multiply">
                    </div>

                    <div class="space-y-3">
                        <span class="text-[10px] font-black uppercase tracking-[0.5em] text-brand block">Registry
                            Access</span>
                        <h2 class="text-4xl font-black text-navy uppercase leading-none tracking-tighter">
                            Institutional <br><span class="text-brand italic font-serif lowercase text-4xl">Login</span>
                        </h2>
                    </div>

                    <p class="text-sm text-navy/40 font-serif italic max-w-[300px] mx-auto">
                        Authenticate with your digital profile to sync your Royal Card registry and elite status.
                    </p>

                    <div class="space-y-4 pt-6">
                        <!-- Google Login -->
                        <button
                            class="w-full bg-white border border-navy/10 py-5 rounded-2xl flex items-center justify-center gap-4 hover:shadow-xl hover:border-brand/30 transition-all group">
                            <i class="fab fa-google text-navy/80 group-hover:text-brand transition-colors"></i>
                            <span class="text-[11px] font-black uppercase tracking-widest text-navy">Continue with
                                Google</span>
                        </button>

                        <!-- Apple Login -->
                        <button
                            class="w-full bg-navy text-white py-5 rounded-2xl flex items-center justify-center gap-4 hover:border-brand transition-all shadow-xl group">
                            <i class="fab fa-apple text-white group-hover:scale-110 transition-transform"></i>
                            <span class="text-[11px] font-black uppercase tracking-widest text-white">Continue with
                                Apple</span>
                        </button>
                    </div>

                    <div class="pt-8 border-t border-navy/5">
                        <p class="text-[9px] font-black uppercase tracking-[0.3em] text-navy/20">
                            Secured by Fairmat Cryptography Protocol
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- TRACKING MODAL -->
        <div v-if="isTrackingOpen" @click="toggleTracking"
            class="fixed inset-0 bg-navy/40 backdrop-blur-xl z-[300] flex items-center justify-center p-6 md:p-12 transition-all duration-700">
            <div @click.stop
                class="bg-navy w-full max-w-[600px] rounded-[3.5rem] overflow-hidden shadow-2xl relative flex flex-col p-8 sm:p-12 lg:p-16 transform-gpu reveal animate-glide-up">

                <!-- Close Button -->
                <button @click="toggleTracking"
                    class="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-brand transition-all">
                    <i class="fas fa-times text-xs"></i>
                </button>

                <div class="relative z-10 space-y-12">
                    <div class="text-center space-y-6">
                        <div class="inline-flex items-center justify-center w-16 h-16 mb-2">
                            <i class="fas fa-satellite-dish text-brand text-2xl"></i>
                        </div>
                        <div class="space-y-3">
                            <span class="text-[10px] font-black uppercase tracking-[0.5em] text-brand block">Logistics
                                Nexus</span>
                            <h2 class="text-4xl font-black text-white uppercase leading-none tracking-tighter">
                                Order <br><span class="text-brand italic font-serif lowercase text-4xl">Tracking</span>
                            </h2>
                        </div>
                        <p class="text-lg text-white/40 font-serif italic max-w-[350px] mx-auto">
                            Sync with our real-time GPS network to monitor your institutional fulfillment.
                        </p>
                    </div>

                    <div class="relative">
                        <input type="text" placeholder="ENTER REGISTRY ID..."
                            class="w-full bg-white/5 border border-white/10 p-8 rounded-[2rem] text-2xl font-black tracking-[0.2em] focus:border-brand outline-none transition-all placeholder:text-white/10 uppercase text-center text-white">
                        <button
                            class="mt-8 w-full bg-brand text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] hover:bg-white hover:text-navy transition-all shadow-2xl">Execute
                            Tracking Scan</button>
                    </div>

                    <div class="pt-8 flex justify-center gap-12 border-t border-white/5">
                        <div v-for="s in ['GPS: Active', 'Chain: Verified', 'Live Status']" :key="s"
                            class="flex items-center gap-2">
                            <div class="w-2 h-2 rounded-full bg-brand animate-pulse"></div>
                            <span class="text-[9px] font-black uppercase tracking-widest text-white/40">{{ s }}</span>
                        </div>
                    </div>
                </div>

                <i class="fas fa-shipping-fast absolute -bottom-20 -right-20 text-[20rem] text-white/[0.02]"></i>
            </div>
        </div>

        <!-- CART MODALS -->
        <div v-if="isCartOpen" @click="toggleCart"
            class="fixed inset-0 bg-navy/20 backdrop-blur-sm z-[200] transition-opacity duration-700">
        </div>

        <!-- Mobile Bubble Cart -->
        <transition name="cart-bubble">
            <div v-if="isCartOpen"
                class="md:hidden fixed bottom-28 left-6 right-6 z-[210] bg-white flex flex-col shadow-2xl rounded-[3rem] p-6 pb-8 cart-bubble-mobile">
                <div class="flex justify-between items-center mb-4">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 flex items-center justify-center shrink-0">
                            <img :src="fairmatLogo" class="w-full h-full object-contain mix-blend-multiply">
                        </div>
                        <h2 class="text-xl font-serif italic">Your Trolley</h2>
                    </div>
                    <button @click="toggleCart" class="text-navy/40 hover:text-brand transition-colors"><i
                            class="fas fa-times"></i></button>
                </div>

                <div class="flex-1 overflow-y-auto space-y-4 py-2 max-h-[40vh]">
                    <div v-if="cartItems.length === 0"
                        class="h-40 flex flex-col items-center justify-center text-center">
                        <p class="text-gray-300 italic font-serif text-xl">Your trolley is empty.</p>
                    </div>
                    <div v-else v-for="(item, idx) in cartItems" :key="idx"
                        class="flex justify-between items-center group/cartitem">
                        <div class="flex flex-col">
                            <span class="font-bold text-sm text-navy">{{ item.name }}</span>
                            <span class="text-[9px] uppercase tracking-widest text-navy/30">Verified Asset</span>
                        </div>
                        <span class="font-serif italic text-navy text-sm">{{ item.price }} KES</span>
                    </div>
                </div>

                <div class="pt-6 border-t border-gray-100 space-y-6">
                    <div class="flex justify-between items-end">
                        <span class="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Total
                            Balance</span>
                        <span class="text-2xl font-serif italic text-navy">{{ totalDisplay }}<span
                                class="text-[8px] uppercase font-sans not-italic ml-2 opacity-40">KES</span></span>
                    </div>
                    <button
                        class="w-full bg-brand text-white py-4 rounded-full font-black text-[10px] tracking-[0.3em] uppercase hover:bg-navy transition shadow-2xl active:scale-95">Proceed
                        to checkout</button>
                </div>
            </div>
        </transition>

        <!-- Desktop Drawer Cart -->
        <transition enter-active-class="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            enter-from-class="translate-x-full" enter-to-class="translate-x-0"
            leave-active-class="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            leave-from-class="translate-x-0" leave-to-class="translate-x-full">
            <div v-if="isCartOpen"
                class="hidden md:flex fixed right-0 top-0 h-full w-[450px] bg-white z-[210] flex-col p-12 lg:p-20 shadow-[-100px_0_100px_rgba(0,0,0,0.05)]">
                <div class="flex justify-between items-center mb-16">
                    <div class="flex items-center gap-6">
                        <div class="w-12 h-12 flex items-center justify-center shrink-0">
                            <img :src="fairmatLogo" class="w-full h-full object-contain mix-blend-multiply">
                        </div>
                        <h2 class="text-4xl font-serif italic">Your Trolley</h2>
                    </div>
                    <button @click="toggleCart" class="text-lg hover:rotate-90 transition-transform duration-500"><i
                            class="fas fa-times"></i></button>
                </div>
                <div class="flex-1 overflow-y-auto space-y-10">
                    <div v-if="cartItems.length === 0"
                        class="h-full flex flex-col items-center justify-center text-center">
                        <p class="text-gray-300 italic font-serif text-2xl mb-4">Your trolley is empty.</p>
                    </div>
                    <div v-else v-for="(item, idx) in cartItems" :key="idx" class="flex justify-between items-center">
                        <span class="font-bold">{{ item.name }}</span>
                        <span class="font-serif italic text-navy">{{ item.price }} KES</span>
                    </div>
                </div>
                <div class="pt-20 border-t border-gray-100 space-y-8">
                    <div class="flex justify-between items-end">
                        <span class="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Total
                            Balance</span>
                        <span class="text-4xl font-serif italic text-navy">{{ totalDisplay }}<span
                                class="text-[10px] uppercase font-sans not-italic ml-2">KES</span></span>
                    </div>
                    <button
                        class="w-full bg-brand text-white py-6 rounded-full font-black text-[11px] tracking-[0.3em] uppercase hover:bg-navy transition shadow-2xl">Proceed
                        to checkout</button>
                </div>
            </div>
        </transition>

        <!--MODAL -->
        <div v-if="isModalVisible" class="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 lg:p-12">
            <div @click="closeProductModal"
                class="absolute inset-0 bg-navy/40 backdrop-blur-xl opacity-100 transition-opacity duration-700">
            </div>
            <div
                class="relative bg-white w-full max-w-4xl h-auto max-h-[90vh] rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-[0_100px_200px_-50px_rgba(0,0,0,0.3)] transform translate-y-0 scale-100 opacity-100 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col lg:flex-row">
                <button @click="closeProductModal"
                    class="absolute top-4 right-4 sm:top-8 sm:right-8 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface border border-gray-100 flex items-center justify-center hover:rotate-90 transition-all z-10">
                    <i class="fas fa-times text-sm sm:text-base"></i>
                </button>
                <div
                    class="lg:w-1/2 h-[300px] sm:h-[400px] lg:h-auto bg-surface p-8 sm:p-16 flex items-center justify-center relative overflow-hidden">
                    <img :src="selectedProduct.img" @error="handleImageError"
                        class="w-full h-full object-contain relative z-10 drop-shadow-2xl">
                </div>
                <div class="lg:w-1/2 p-6 sm:p-12 lg:p-20 flex flex-col justify-between overflow-y-auto">
                    <div>
                        <span class="text-[10px] font-black uppercase tracking-[0.4em] text-brand">{{
                            selectedProduct.category }}</span>
                        <h2 class="text-4xl font-black text-navy uppercase leading-none tracking-tighter mb-4">
                            {{
                                selectedProduct.name }}</h2>
                        <p class="text-navy/60 text-lg leading-relaxed font-serif italic">{{
                            selectedProduct.desc }}</p>
                    </div>
                    <div class="mt-16 space-y-8">
                        <div class="flex justify-between items-end">
                            <span class="text-4xl font-serif italic text-navy">KES {{
                                selectedProduct.price }}</span>
                            <button @click="addToCart(selectedProduct.price, selectedProduct.name)"
                                class="bg-brand text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition shadow-lg">Add
                                to trolley</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- FLOATING BOTTOM CONTROLS (MOBILE) -->
        <div
            class="md:hidden fixed bottom-6 left-0 right-0 z-[100] px-6 pointer-events-none flex items-center justify-between">
            <!-- Space for symmetry or other buttons -->
            <div class="w-12 h-12"></div>

            <!-- MOBILE BASKET (Middle Below) -->
            <button @click="toggleCart"
                class="w-12 h-12 bg-brand text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition relative pointer-events-auto border-[3px] border-white">
                <i class="fas fa-shopping-basket text-sm"></i>
                <span id="bagCount"
                    class="absolute -top-1 -right-1 w-4 h-4 bg-navy rounded-full border-2 border-white text-[8px] font-black flex items-center justify-center">{{
                        bagCount }}</span>
            </button>

            <!-- SCROLL TO TOP (Right side, same level) -->
            <transition enter-active-class="duration-300 ease-out" leave-active-class="duration-200 ease-in"
                enter-from-class="opacity-0 translate-y-4" leave-to-class="opacity-0 translate-y-4">
                <button v-if="showScrollTop" @click="scrollToTop"
                    class="w-12 h-12 bg-navy text-white rounded-full shadow-2xl flex items-center justify-center group pointer-events-auto border-2 border-white/20"
                    aria-label="Scroll to top">
                    <i class="fas fa-arrow-up text-sm group-hover:-translate-y-1 transition-transform"></i>
                </button>
                <div v-else class="w-12 h-12"></div>
            </transition>
        </div>

        <!-- DESKTOP SCROLL TO TOP -->
        <transition enter-active-class="duration-300 ease-out" leave-active-class="duration-200 ease-in"
            enter-from-class="opacity-0 translate-y-4" leave-to-class="opacity-0 translate-y-4">
            <button v-if="showScrollTop" @click="scrollToTop"
                class="hidden md:flex fixed bottom-10 right-10 z-[100] w-14 h-14 bg-brand text-white rounded-full shadow-2xl hover:shadow-brand/50 hover:scale-110 transition-all duration-300 items-center justify-center group border-2 border-white/20"
                aria-label="Scroll to top">
                <i class="fas fa-arrow-up text-lg group-hover:-translate-y-1 transition-transform"></i>
                <div
                    class="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500 opacity-0 group-hover:opacity-100">
                </div>
            </button>
        </transition>

    </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&family=Fredoka+One&family=Michroma&display=swap');

.reveal {
    opacity: 0;
    transform: translateY(30px);
    transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
}

.reveal.active {
    opacity: 1;
    transform: translateY(0);
}

@keyframes fade-in {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

.animate-fade-in {
    animation: fade-in 1.5s ease-out forwards;
}

@keyframes fade-in-up {
    0% {
        opacity: 0;
        transform: translateY(20px);
    }

    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in-up {
    animation: fade-in-up 0.8s ease-out forwards;
}

@keyframes slide-in-right {
    0% {
        opacity: 0;
        transform: translateX(30px);
    }

    100% {
        opacity: 1;
        transform: translateX(0);
    }
}

.animate-slide-in-right {
    animation: slide-in-right 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes glide-up {
    0% {
        transform: translateY(40px);
        opacity: 0;
    }

    100% {
        transform: translateY(0);
        opacity: 1;
    }
}

.animate-glide-up {
    animation: glide-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes tracking-in-expand {
    0% {
        letter-spacing: -0.5em;
        opacity: 0;
    }

    40% {
        opacity: 0.6;
    }

    100% {
        opacity: 1;
    }
}

.animate-tracking-in-expand {
    animation: tracking-in-expand 1.5s cubic-bezier(0.215, 0.610, 0.355, 1.000) both;
    animation-delay: 0.3s;
}

@keyframes swing {
    0% {
        transform: rotate(-10deg);
    }

    50% {
        transform: rotate(10deg);
    }

    100% {
        transform: rotate(-10deg);
    }
}

.animate-swing {
    animation: swing 2s infinite ease-in-out;
    transform-origin: top center;
}

.animate-swing-slow {
    animation: swing 6s infinite ease-in-out;
    transform-origin: top center;
}

.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

@keyframes progress-bar {
    0% {
        transform: translateX(-100%);
    }

    100% {
        transform: translateX(0);
    }
}

.animate-progress-bar {
    animation: progress-bar 5000ms linear infinite;
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-30px);
    }
}

.animate-float {
    animation: float 8s ease-in-out infinite;
}

/* Transitions for carousel */
.carousel-slide-enter-active,
.carousel-slide-leave-active {
    transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
}

.carousel-slide-enter-from {
    opacity: 0;
    transform: translateX(60px) scale(0.9);
    filter: blur(10px);
}

@keyframes scroll-line {
    0% {
        transform: translateY(-100%);
    }

    100% {
        transform: translateY(200%);
    }
}

.animate-scroll-line {
    animation: scroll-line 2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

.carousel-slide-leave-to {
    opacity: 0;
    transform: translateX(-60px) scale(1.1);
    filter: blur(10px);
}

.vertical-text {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    transform: rotate(180deg);
}

@keyframes cart-pop {
    0% {
        opacity: 0;
        transform: translateY(30px) scale(0.5);
        transform-origin: bottom center;
    }

    60% {
        transform: translateY(-10px) scale(1.05);
    }

    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes cart-pop-out {
    0% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }

    100% {
        opacity: 0;
        transform: translateY(30px) scale(0.5);
    }
}

.cart-bubble-enter-active {
    animation: cart-pop 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.cart-bubble-leave-active {
    animation: cart-pop-out 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.cart-bubble-mobile::after {
    content: '';
    position: absolute;
    bottom: -12px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 14px solid transparent;
    border-right: 14px solid transparent;
    border-top: 14px solid white;
    filter: drop-shadow(0 5px 5px rgba(0, 0, 0, 0.05));
}
</style>
```