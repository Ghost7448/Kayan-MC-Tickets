const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    REST,
    Routes,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionsBitField,
    ChannelType,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');

const transcripts = require('discord-html-transcripts');

const claimedTickets = new Map();

require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

function isStaff(member) {
    return (
        member.roles.cache.has(process.env.STAFF_ROLE_1) ||
        member.roles.cache.has(process.env.STAFF_ROLE_2)
    );
}

const banner = 'https://i.postimg.cc/q7SXpKnf/8f49b9956532b3b688363aa0c5b8008b.jpg';

const tickets = {

    store: {
        name: 'متجر',
        emoji: '📩',
        category: process.env.CATEGORY_STORE,
        role: process.env.ROLE_STORE
    },

    other: {
        name: ' اخرى',
        emoji: '📁',
        category: process.env.CATEGORY_OTHER,
        role: process.env.ROLE_OTHER
    },

    report: {
        name: 'شكوي ',
        emoji: '📩',
        category: process.env.CATEGORY_REPORT,
        role: process.env.ROLE_REPORT
    },

    compensation: {
        name: 'تعويضات',
        emoji: '💰',
        category: process.env.CATEGORY_COMPENSATION,
        role: process.env.ROLE_COMPENSATION
    },

    monitoring: {
        name: 'رقابه',
        emoji: '🛡️',
        category: process.env.CATEGORY_MONITORING,
        role: process.env.ROLE_MONITORING
    },

    support: {
        name: 'دعم فني',
        emoji: '🖥️',
        category: process.env.CATEGORY_SUPPORT,
        role: process.env.ROLE_SUPPORT
    },
    management: {
        name: 'اداره',
        emoji: '👑',
        category: process.env.CATEGORY_MANAGEMENT,
        role: process.env.ROLE_MANAGEMENT
    }
};

client.once('clientReady', async () => {
    console.log(`${client.user.tag} جاهز`);
});

    const embed = new EmbedBuilder()
        .setColor('#ffcc00')
        .setTitle('📩 Kayan MC Support Center')
        .setDescription(`
## 🎟️ نظام التذاكر
 ### اختر نوع التيكت الذي تريده للحصول على الدعم

**🛒 المتجر
تيكت لشراء المنتجات داخل السيرفر اذكر ما تريد شراؤه والتفاصيل.

اضغط الزر أدناه لإنشاء تيكت من نوع المتجر

🚨 الرقابة
للشكاوى أو المشاكل التي تتعلق بالرقابة والسلوك داخل السيرفر. اذكر الأدلة.

اضغط الزر أدناه لإنشاء تيكت من نوع الرقابة

📩 شكوي
لتقديم شكوى رسمية.

اضغط الزر أدناه لإنشاء تيكت من نوع شكوي

🛠️ دعم فني
للحصول على مساعدة تقنية.

اضغط الزر أدناه لإنشاء تيكت من نوع دعم فني

اضغط الزر أدناه لإنشاء تيكت من نوع العصابات

💰 التعوضات
لتقديم طلب تعويض عن فقدان ممتلكات أو خسارة ناتجة عن خطأ أو مشكلة داخل السيرفر

اضغط الزر أدناه لإنشاء تيكت من نوع تعوضات

🧑‍💼 الإدارة
استفسارات ومخاطبة إدارة السيرفر.

اضغط الزر أدناه لإنشاء تيكت من نوع الإدارة

❓ أخرى
لأي استفسارات أخرى.

اضغط الزر أدناه لإنشاء تيكت من نوع اخرى**

> يرجي اختيار القسم الصحيح للحصول علي المساعدة
        `)
        .setImage(banner)
        .setFooter({
            text: 'Kayan MC Ticket System'
        });

    const menu = new StringSelectMenuBuilder()
        .setCustomId('ticket_menu')
        .setPlaceholder('اختر القسم');

    Object.entries(tickets).forEach(([key, value]) => {
        menu.addOptions({
            label: value.name,
            value: key,
            emoji: value.emoji
        });
    });

    const row = new ActionRowBuilder().addComponents(menu);


client.on('interactionCreate', async interaction => {

    if (interaction.isChatInputCommand()) {

    if (interaction.commandName === 'ticket') {

        if (
            !interaction.member.roles.cache.has(process.env.TICKET_PANEL_ROLE)
        ) {
            return interaction.reply({
                content: '❌ ليس لديك صلاحية',
                ephemeral: true
            });
        }

await interaction.reply({
    embeds: [embed],
    components: [row],
    ephemeral: false
});

    }
}

    if (interaction.isStringSelectMenu()) {

        if (interaction.customId === 'ticket_menu') {

            await interaction.deferReply({ ephemeral: true });

            const data = tickets[interaction.values[0]];

            const channel = await interaction.guild.channels.create({
                name: `تذكرة_${data.name}_${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: data.category,

                permissionOverwrites: [

                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel]
                    },

                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ReadMessageHistory
                        ]
                    },

                    {
    id: process.env.STAFF_ROLE_1,
    allow: [
        PermissionsBitField.Flags.ViewChannel,
        PermissionsBitField.Flags.SendMessages,
        PermissionsBitField.Flags.ReadMessageHistory
    ]
},
{
    id: process.env.STAFF_ROLE_2,
    allow: [
        PermissionsBitField.Flags.ViewChannel,
        PermissionsBitField.Flags.SendMessages,
        PermissionsBitField.Flags.ReadMessageHistory
    ]
}
                ]
            });

            let description = ``;

            // ================= STORE =================

            if (interaction.values[0] === 'store') {

                description = `
 
تم إنشاء تذكرة:🎟️
شكراً لتواصلك معنا 👤 ${interaction.user}
━━━━━━━━━━━━━━━━━━━━━━
📌 نوع التذكرة
متجر
🔎 شرح التذكرة
لشراء او السؤال عن الاشياء التي يمكنك شراؤها دخل السيرفر
📝 ماذا يحدث الآن؟
✅ تم إنشاء قناة خاصة لك
✅ سيقوم فريق الدعم بالرد عليك قريباً
✅ يرجى شرح المشكلة بالتفصيل
✅ احرص على الرد بسرعة
━━━━━━━━━━━━━━━━━━━━━━
⚡ الخطوات التالية:
1️⃣ اشرح المشكلة أو الطلب بالتفصيل
2️⃣ انتظر رد فريق الدعم
3️⃣ عندما تنتهي اضغط "إغلاق التيكت"
━━━━━━━━━━━━━━━━━━━━━━
💡 نصائح مهمة:
• كن واضحاً ومفصلاً في شرحك
• لا تشارك معلومات شخصية حساسة
• انتظر الرد بصبر
• شكراً لصبرك! 🙏
━━━━━━━━━━━━━━━━━━━━━━
                `;
            }

            // ================= OTHER =================

            if (interaction.values[0] === 'other') {

                description = `

 تم إنشاء تذكرة:🎟️
شكراً لتواصلك معنا 👤 ${interaction.user}
━━━━━━━━━━━━━━━━━━━━━━━
📌 نوع التذكرة
اخري
🔎 شرح التذكرة
للاستفسار عن اي شيء داخل السيرفر
📝 ماذا يحدث الآن؟
✅ تم إنشاء قناة خاصة لك
✅ سيقوم فريق الدعم بالرد عليك قريباً
✅ يرجى شرح المشكلة بالتفصيل
✅ احرص على الرد بسرعة
━━━━━━━━━━━━━━━━━━━━━━━
⚡ الخطوات التالية:
1️⃣ اشرح المشكلة أو الطلب بالتفصيل
2️⃣ انتظر رد فريق الدعم
3️⃣ عندما تنتهي اضغط "إغلاق التيكت"
━━━━━━━━━━━━━━━━━━━━━━━
💡 نصائح مهمة:
• كن واضحاً ومفصلاً في شرحك
• لا تشارك معلومات شخصية حساسة
• انتظر الرد بصبر
• شكراً لصبرك! 🙏
━━━━━━━━━━━━━━━━━━━━━━━
                `;
            }

            // ================= REPORT =================

            if (interaction.values[0] === 'report') {

                description = `

 تم إنشاء تذكرة:🎟️
شكراً لتواصلك معنا 👤 ${interaction.user}
━━━━━━━━━━━━━━━━━━━━━━━
📌 نوع التذكرة
شكوي
🔎 شرح التذكرة
للشكاوى أو المشاكل التي تتعلق بالرقابة والسلوك داخل السيرفر. اذكر الأدلة.
📝 ماذا يحدث الآن؟
✅ تم إنشاء قناة خاصة لك
✅ سيقوم فريق الدعم بالرد عليك قريباً
✅ يرجى شرح المشكلة بالتفصيل
✅ احرص على الرد بسرعة
━━━━━━━━━━━━━━━━━━━━━━━
⚡ الخطوات التالية:
1️⃣ اشرح المشكلة أو الطلب بالتفصيل
2️⃣ انتظر رد فريق الدعم
3️⃣ عندما تنتهي اضغط "إغلاق التيكت"
━━━━━━━━━━━━━━━━━━━━━━━
💡 نصائح مهمة:
• كن واضحاً ومفصلاً في شرحك
• لا تشارك معلومات شخصية حساسة
• انتظر الرد بصبر
• شكراً لصبرك! 🙏
━━━━━━━━━━━━━━━━━━━━━━━
                `;
            }

            // ================= COMPENSATION =================

            if (interaction.values[0] === 'compensation') {

                description = `

 تم إنشاء تذكرة:🎟️
شكراً لتواصلك معنا 👤 ${interaction.user}
━━━━━━━━━━━━━━━━━━━━━━━
📌 نوع التذكرة
تعويضات
🔎 شرح التذكرة
للشكوي عن اي متعلفات تم فقدانها بسبب خطء داخل السيرفر
📝 ماذا يحدث الآن؟
✅ تم إنشاء قناة خاصة لك
✅ سيقوم فريق الدعم بالرد عليك قريباً
✅ يرجى شرح المشكلة بالتفصيل
✅ احرص على الرد بسرعة
━━━━━━━━━━━━━━━━━━━━━━━
⚡ الخطوات التالية:
1️⃣ اشرح المشكلة أو الطلب بالتفصيل
2️⃣ انتظر رد فريق الدعم
3️⃣ عندما تنتهي اضغط "إغلاق التيكت"
━━━━━━━━━━━━━━━━━━━━━━━
💡 نصائح مهمة:
• كن واضحاً ومفصلاً في شرحك
• لا تشارك معلومات شخصية حساسة
• انتظر الرد بصبر
• شكراً لصبرك! 🙏
━━━━━━━━━━━━━━━━━━━━━━━
                `;
            }

            // ================= MONITORING =================

            if (interaction.values[0] === 'monitoring') {

                description = `

 تم إنشاء تذكرة:🎟️
شكراً لتواصلك معنا 👤 ${interaction.user}
━━━━━━━━━━━━━━━━━━━━━━━
📌 نوع التذكرة
رقابه
🔎 شرح التذكرة
للشكاوى أو المشاكل التي تتعلق بالرقابة والسلوك داخل السيرفر. اذكر الأدلة.
📝 ماذا يحدث الآن؟
✅ تم إنشاء قناة خاصة لك
✅ سيقوم فريق الدعم بالرد عليك قريباً
✅ يرجى شرح المشكلة بالتفصيل
✅ احرص على الرد بسرعة
━━━━━━━━━━━━━━━━━━━━━━━
⚡ الخطوات التالية:
1️⃣ اشرح المشكلة أو الطلب بالتفصيل
2️⃣ انتظر رد فريق الدعم
3️⃣ عندما تنتهي اضغط "إغلاق التيكت"
━━━━━━━━━━━━━━━━━━━━━━━
💡 نصائح مهمة:
• كن واضحاً ومفصلاً في شرحك
• لا تشارك معلومات شخصية حساسة
• انتظر الرد بصبر
• شكراً لصبرك! 🙏
━━━━━━━━━━━━━━━━━━━━━━━
                `;
            }


            // ================= SUPPORT =================

            if (interaction.values[0] === 'support') {

                description = `

 تم إنشاء تذكرة:🎟️
شكراً لتواصلك معنا 👤 ${interaction.user}
━━━━━━━━━━━━━━━━━━━━━━━
📌 نوع التذكرة
دعم فني
🔎 شرح التذكرة
للحصول علي اي مساعده او اعطال فنيه
📝 ماذا يحدث الآن؟
✅ تم إنشاء قناة خاصة لك
✅ سيقوم فريق الدعم بالرد عليك قريباً
✅ يرجى شرح المشكلة بالتفصيل
✅ احرص على الرد بسرعة
━━━━━━━━━━━━━━━━━━━━━━━
⚡ الخطوات التالية:
1️⃣ اشرح المشكلة أو الطلب بالتفصيل
2️⃣ انتظر رد فريق الدعم
3️⃣ عندما تنتهي اضغط "إغلاق التيكت"
━━━━━━━━━━━━━━━━━━━━━━━
💡 نصائح مهمة:
• كن واضحاً ومفصلاً في شرحك
• لا تشارك معلومات شخصية حساسة
• انتظر الرد بصبر
• شكراً لصبرك! 🙏
━━━━━━━━━━━━━━━━━━━━━━━
                `;
            }


            // ================= MANAGEMENT =================

            if (interaction.values[0] === 'management') {

                description = `

 تم إنشاء تذكرة:🎟️
شكراً لتواصلك معنا 👤 ${interaction.user}
━━━━━━━━━━━━━━━━━━━━━━━
📌 نوع التذكرة
اداره
🔎 شرح التذكرة
للتحدث مع افراد الاداره للاقتراحات او الشكاوي
📝 ماذا يحدث الآن؟
✅ تم إنشاء قناة خاصة لك
✅ سيقوم فريق الدعم بالرد عليك قريباً
✅ يرجى شرح المشكلة بالتفصيل
✅ احرص على الرد بسرعة
━━━━━━━━━━━━━━━━━━━━━━━
⚡ الخطوات التالية:
1️⃣ اشرح المشكلة أو الطلب بالتفصيل
2️⃣ انتظر رد فريق الدعم
3️⃣ عندما تنتهي اضغط "إغلاق التيكت"
━━━━━━━━━━━━━━━━━━━━━━━
💡 نصائح مهمة:
• كن واضحاً ومفصلاً في شرحك
• لا تشارك معلومات شخصية حساسة
• انتظر الرد بصبر
• شكراً لصبرك! 🙏
━━━━━━━━━━━━━━━━━━━━━━━
                `;
            }

            const ticketEmbed = new EmbedBuilder()
                .setColor('#ffcc00')
                .setTitle(`${data.emoji} ${data.name}`)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setDescription(description)
                .setFooter({
                    text: 'Kayan MC Ticket System'
                });

const buttons = new ActionRowBuilder().addComponents(

     new ButtonBuilder()
        .setCustomId('claim_ticket')
        .setLabel('استلام')
        .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('اغلاق')
        .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
        .setCustomId('delete_ticket')
        .setLabel('حذف')
        .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
        .setCustomId('rename_ticket')
        .setLabel('تغيير الاسم')
        .setStyle(ButtonStyle.Primary)
);

            await channel.send({
    content: `<@&${data.role}> | ${interaction.user}`,
    embeds: [ticketEmbed],
    components: [buttons]
});

            const logChannel = client.channels.cache.get(process.env.LOG_CHANNEL_ID);

            const logEmbed = new EmbedBuilder()
                .setColor('#ffcc00')
                .setTitle('📥 Ticket Opened')
                .setDescription(`
👤 ${interaction.user}

📁 ${channel}

📌 ${data.name}
                `)
                .setTimestamp();

            await logChannel.send({
                embeds: [logEmbed]
            });

            await interaction.editReply({
                content: `✅ تم إنشاء التذكرة ${channel}`,
            });
        }
   }

if (interaction.isModalSubmit()) {

    if (interaction.customId === 'rename_modal') {

        const newName = interaction.fields.getTextInputValue('ticket_name');

        await interaction.channel.setName(
            newName
                .toLowerCase()
                .replace(/[^a-zA-Z0-9\u0600-\u06FF-_]/g, '-')
                .slice(0, 90)
        );

        return await interaction.reply({
            content: `✅ تم تغيير اسم التذكرة الي ${newName}`,
            flags: 64
        });
    }
}

    if (interaction.isButton()) {

        if (interaction.customId === 'rename_ticket') {

    const modal = new ModalBuilder()
        .setCustomId('rename_modal')
        .setTitle('تغيير اسم التذكرة');

    const input = new TextInputBuilder()
        .setCustomId('ticket_name')
        .setLabel('الاسم الجديد')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const row = new ActionRowBuilder().addComponents(input);

    modal.addComponents(row);

    return await interaction.showModal(modal);
}

        if (interaction.customId === 'claim_ticket') {

    const ticketType = Object.keys(tickets).find(key =>
        interaction.channel.name.includes(tickets[key].name)
    );


    if (!isStaff(interaction.member)) {
    return interaction.reply({
        content: '❌ ليس لديك صلاحية استلام هذا التكت',
        ephemeral: true
    });
}

    await interaction.channel.setName(
    `Claimed_${interaction.user.username}`
);

claimedTickets.set(interaction.channel.id, interaction.user.id);

const logChannel = interaction.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);

await logChannel.send({
    embeds: [
        new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('📌 Ticket Claimed')
            .addFields(
                { name: '👤 Claimed By', value: `<@${interaction.user.id}>` },
                { name: '📁 Channel', value: `${interaction.channel}` }
            )
            .setTimestamp()
    ]
});

    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ تم استلام التذكرة')
        .setDescription(`تم استلام التذكرة بواسطة ${interaction.user}

سيتم الرد عليك قريباً.`);

    await interaction.reply({
        embeds: [embed]
    });
}

        if (interaction.customId === 'close_ticket') {

           const logChannel = interaction.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);

await logChannel.send({
    embeds: [
        new EmbedBuilder()
            .setColor('#ffaa00')
            .setTitle('🔒 Ticket Closed')
            .addFields(
                { name: '🔒 Closed By', value: `<@${interaction.user.id}>` },
                { name: '📁 Channel', value: `${interaction.channel}` }
            )
            .setTimestamp()
    ]
});
            await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
                SendMessages: false
            });

            await interaction.channel.setName(`closed-claimed-${interaction.user.username}`);

            const embed = new EmbedBuilder()
                .setColor('#ffaa00')
                .setTitle('🔒 تم إغلاق التذكرة')
                .setDescription(`
تم اغلاق التذكرة بواسطة ${interaction.user}
                `)

            await interaction.reply({
                embeds: [embed]
            });
        }

       if (interaction.customId === 'delete_ticket') {

        const claimedBy = claimedTickets.get(interaction.channel.id);

const transcript = await transcripts.createTranscript(interaction.channel, {
    limit: -1,
    returnType: 'attachment',
    fileName: `${interaction.channel.name}.html`
});

const logChannel = interaction.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);

await logChannel.send({
    embeds: [
        new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('🗑️ Ticket Deleted')
            .addFields(
                { name: 'Deleted By', value: `<@${interaction.user.id}>` },
                { name: 'Claimed By', value: claimedBy ? `<@${claimedBy}>` : 'Not Claimed' }
            )
    ],
    files: [transcript]
});


    if (!isStaff(interaction.member)) {
    return interaction.reply({
        content: '❌ ليس لديك صلاحية حذف هذا التكت',
        ephemeral: true
    });
}

    const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🗑️ حذف التذكرة')
        .setDescription('سيتم حذف التذكرة بعد 5 ثواني.');

    await interaction.reply({ embeds: [embed] });

    setTimeout(() => {
        interaction.channel.delete();
    }, 5000);
}
    }

});

client.once('ready', async () => {

    const commands = [
        new SlashCommandBuilder()
            .setName('ticket')
            .setDescription('ارسال بانل التذاكر')
    ];

    const rest = new REST({ version: '10' })
        .setToken(process.env.TOKEN);

    await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands }
    );

    console.log('Slash Commands Loaded');
});

client.login(process.env.TOKEN);