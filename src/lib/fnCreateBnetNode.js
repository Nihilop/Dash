const path = require('path')
const mime = require('mime-types')
import log from 'electron-log'
function fnCreateBnetNode (fileInfo) {
  const getLastItem = thePath => thePath.substring(thePath.lastIndexOf('\\') + 1)
  let nodeKey = fileInfo.rootDir
  let appid
  let meta
  let exec
  let processName
  if (nodeKey.charAt(nodeKey.length - 1) !== path.sep) {
    nodeKey += path.sep
  }
  if (fileInfo.fileName === path.sep) {
    fileInfo.fileName = nodeKey
  } else {
    nodeKey += fileInfo.fileName
  }
  const mimeType = mime.lookup(nodeKey)
  const lastKey = getLastItem(nodeKey)
  const gameName = ['Call of Duty', 'Call of Duty Modern Warfare', 'Crash Bandicoot', 'Diablo III', 'Heartstone', 'Heroes of the Storm', 'Overwatch','StarCraft', 'StarCraft II', 'Warcraft III', 'World of Warcraft']
  const gameMatching = gameName.includes(lastKey)
  log.warn(`%c${lastKey}`, 'color:red')
  log.warn('EST-CE QUE CA MATCH : ' + gameMatching + ' Pour le jeu : ' + fileInfo.fileName)
  if(gameMatching) {
    log.info('It is a battle.net game')
    if (fileInfo.fileName === 'Call of Duty: Black Ops 4') {
      appid = 'VIPR'
      processName = ''
      meta = {
        app_name: "Call of Duty: Black Ops 4",
        background: "background-image: url('https://www.callofduty.com/content/dam/atvi/callofduty/blackops4/home/BO4-Home-Hero-Background.jpg')",
        categories: ['Multijoueur', 'FPS', 'BattleNet'],
        cover:`/img/bnet/${appid}.jpg`,
        description: "Call of Duty: Black Ops 4 est un jeu vidéo de tir à la première personne développé par Treyarch et édité par Activision, sorti le 12 octobre 2018 sur PlayStation 4, Nintendo Switch, Xbox One et Microsoft Windows.",      
        tags: ['Multijoueur', 'FPS', 'Shoot'],
        video:"",
      }
    } else if (fileInfo.fileName === 'Call of Duty Black Ops Cold War') {
      appid = 'codbocw'
      processName = ''
      meta = {
        app_name: "Call of Duty Black Ops Cold War",
        background: "background-image: url('')",
        categories: ['Multijoueur', 'FPS', 'BattleNet'],
        cover:`/img/bnet/${appid}.jpg`,
        description: "",      
        tags: ['Multijoueur', 'FPS', 'Shoot'],
        video:"",
      }
    } else if (fileInfo.fileName === 'Call of Duty Modern Warfare') {
      appid = 'codmw2019'
      processName = ''
      meta = {
        app_name: "Call of Duty Modern Warfare",
        background: "background-image: url('')",
        categories: [],
        cover:`/img/bnet/${appid}.jpg`,
        description: "",      
        tags: [],
        video:"",
      }
    } else if (fileInfo.fileName === 'Call of Duty Modern Warfare 2 Campaign Remastered') {
      appid = 'codmw2crm'
      processName = ''
      meta = {
        app_name: "Call of Duty Modern Warfare 2 Campaign Remastered",
        background: "background-image: url('')",
        categories: [],
        cover:`/img/bnet/${appid}.jpg`,
        description: "",      
        tags: [],
        video:"/img/bnet/CB4.mp4",
      }
    } else if (fileInfo.fileName === 'Crash Bandicoot 4: It’s About Time') {
      appid = 'cb4'
      processName = ''
      meta = {
        app_name: "Crash Bandicoot 4: It’s About Time",
        background: "background-image: url('/img/bnet/${appid}.jpg')",
        categories: ['Solo?'],
        cover:`/img/bnet/${appid}.jpg`,
        description: "",      
        tags: [],
        video:"Crash Bandicoot 4: It's About Time est un jeu vidéo de plates-formes développé par le studio Toys for Bob et édité par Activision, sorti sur PlayStation 4 et Xbox One le 2 octobre 2020, puis le 12 mars 2021 sur PlayStation 5, Xbox Series et Nintendo Switch. Une version PC est également prévue pour 2021.",
      }
    } else if (fileInfo.fileName === 'Diablo III') {
      appid = 'D3'
      processName = 'Diablo III64.exe'
      meta = {
        app_name: "Diablo III",
        background: "background-image: url('https://blzmedia-a.akamaihd.net/d3/media/screenshots/reaper-of-souls-12-large.jpg')",
        categories: [],
        cover:`/img/bnet/${appid}.jpg`,
        description: "Diablo III est un jeu vidéo d'action et de rôle de type hack and slash développé par Blizzard Entertainment. Il constitue le troisième opus de la série, succédant à Diablo et à Diablo II. Publié par Activision Blizzard, le jeu a bénéficié d'une sortie mondiale le 15 mai 2012.",      
        tags: [],
        video:"https://bnetcmsus-a.akamaihd.net/cms/template_resource/mc/MCBOAD2OSZI21497561030686.mp4",
      }
    } else if (fileInfo.fileName === 'Diablo III Public Test Realm') {
      appid = 'd3ptr'
      processName = ''
      meta = {
        app_name: "Diablo III - PTR",
        background: "background-image: url('https://blzmedia-a.akamaihd.net/d3/media/screenshots/reaper-of-souls-12-large.jpg')",
        categories: [],
        cover:`/img/bnet/${appid}.jpg`,
        description: "Diablo III est un jeu vidéo d'action et de rôle de type hack and slash développé par Blizzard Entertainment. Il constitue le troisième opus de la série, succédant à Diablo et à Diablo II. Publié par Activision Blizzard, le jeu a bénéficié d'une sortie mondiale le 15 mai 2012.",      
        tags: [],
        video:"https://bnetcmsus-a.akamaihd.net/cms/template_resource/mc/MCBOAD2OSZI21497561030686.mp4",
      }
    } else if (fileInfo.fileName === 'Heartstone') {
      appid = 'WTCG'
      processName = ''
      meta = {
        app_name: "Heartstone",
        background: "background-image: url('https://images.blz-contentstack.com/v3/assets/bltc965041283bac56c/blt93a1ba1e112f0d47/5f234800bb238f5556376a79/homepage_star_bg.jpg?auto=webp')",
        categories: [],
        cover:`/img/bnet/${appid}.jpg`,
        description: "Hearthstone est un jeu de cartes à collectionner en ligne, développé et édité par la société Blizzard Entertainment. C'est un jeu gratuit s'inspirant de l'univers de fiction médiéval-fantastique du jeu vidéo Warcraft développé par Blizzard.",      
        tags: [],
        video:"https://assets.blz-contentstack.com/v3/assets/bltc965041283bac56c/blt5f2da92f3229e1dd/5f198eb94afc510797a4f325/homepage_header_video.mp4",
      }
    } else if (fileInfo.fileName === 'Heroes of the Storm') {
      appid = 'Hero'
      processName = 'HeroesOfTheStorm_x64.exe'
      meta = {
        app_name: "Heroes of the Storm",
        background: "background-image: url('https://blzmedia-a.akamaihd.net/heroes/images/media/cinematic.jpg')",
        categories: [],
        cover:`/img/bnet/${appid}.jpg`,
        description: "Heroes of the Storm est un jeu vidéo de type arène de bataille en ligne multijoueur, édité et développé par Blizzard Entertainment, sorti le 2 juin 2015 sur Windows et Mac OS X.",      
        tags: [],
        video:"https://assets.blz-contentstack.com/v3/assets/blta565ae3223b62a29/blt56c5db1b1d5c5203/5e28d2ed561a623cdc51fe10/deathwing.mp4",
      }
    } else if (fileInfo.fileName === 'Overwatch') {
      appid = 'Pro'
      processName = 'Overwatch.exe'
      meta = {
        app_name: "Overwatch",
        background: "background-image: url('https://images.blz-contentstack.com/v3/assets/blt2477dcaf4ebd440c/blt39c0f9a040a3cf2a/5ff79ac3c34a7345d04cfec5/kanezaka-screenshot-004.jpg')",
        categories: ['En ligne', 'FPS', 'BigRage', 'FullLoose'],
        cover:`/img/bnet/${appid}.jpg`,
        description: "Overwatch est un jeu vidéo de tir en ligne et en équipe de 6, développé et publié par Blizzard Entertainment. Le jeu est annoncé le 7 novembre 2014 à la BlizzCon, et est commercialisé le 24 mai 2016 sur Windows, PlayStation 4 et Xbox One et le 15 octobre 2019 sur Nintendo Switch.",      
        tags: ['Multijoueur', 'FPS', 'FFA'],
        video:"https://static.playoverwatch.com/video/pages/home/header-mobile-67d8123055.webm",
      }
    } else if (fileInfo.fileName === 'Overwatch Public Test Realm') {
      appid = 'owptr'
      processName = ''
      meta = {
        app_name: "Overwatch PTR",
        background: "background-image: url('https://images.blz-contentstack.com/v3/assets/blt2477dcaf4ebd440c/blt39c0f9a040a3cf2a/5ff79ac3c34a7345d04cfec5/kanezaka-screenshot-004.jpg')",
        categories: ['En ligne', 'FPS', 'BigRage', 'FullLoose'],
        cover:`/img/bnet/${appid}.jpg`,
        description: "Overwatch est un jeu vidéo de tir en ligne et en équipe de 6, développé et publié par Blizzard Entertainment. Le jeu est annoncé le 7 novembre 2014 à la BlizzCon, et est commercialisé le 24 mai 2016 sur Windows, PlayStation 4 et Xbox One et le 15 octobre 2019 sur Nintendo Switch.",      
        tags: ['Multijoueur', 'FPS', 'FFA'],
        video:"https://static.playoverwatch.com/video/pages/home/header-mobile-67d8123055.webm",
      }
    } else if (fileInfo.fileName === 'Starcraft Remastered') {
      appid = 'scr'
      processName = ''
      meta = {
        app_name: "",
        background: "background-image: url('')",
        categories: [],
        cover:`/img/bnet/${appid}.jpg`,
        description: "",      
        tags: [],
        video:"",
      }
    } else if (fileInfo.fileName === 'StarCraft II') {
      appid = 'S2'
      processName = 'StarCraft II.exe'
      meta = {
        app_name: "",
        background: "background-image: url('')",
        categories: [],
        cover:`/img/bnet/${appid}.jpg`,
        description: "",      
        tags: [],
        video:"",
      }
    } else if (fileInfo.fileName === 'Warcraft III') {
      appid = 'W3'
      processName = 'Warcraft III.exe'
      meta = {
        app_name: "",
        background: "background-image: url('')",
        categories: [],
        cover:`/img/bnet/${appid}.jpg`,
        description: "",      
        tags: [],
        video:"",
      }
    } else if (fileInfo.fileName === 'World of Warcraft') {
      appid = 'WoW'
      processName = 'Wow.exe'
      meta = {
        app_name: "",
        background: "background-image: url('//bnetcmsus-a.akamaihd.net/cms/blog_header/ze/ZE5YC83V7D121622067139361.jpg')",
        categories: ['Meuporg', 'MMORPG'],
        cover:`/img/bnet/${appid}.jpg`,
        description: "World of Warcraft /wɜrld.əv.wɔr.kræft/ est un jeu vidéo de type MMORPG développé par la société Blizzard Entertainment. C'est le 4ᵉ jeu de l'univers médiéval-fantastique Warcraft, introduit par Warcraft: Orcs and Humans en 1994.",      
        tags: [],
        video:"https://bnetcmsus-a.akamaihd.net/cms/template_resource/cu/CUQUP0SYRRU51621896234428.mp4",
      }
    } else if (fileInfo.fileName === 'World of Warcraft Classic') {
      appid = 'wowclassic'
      processName = ''
      meta = {
        app_name: "",
        background: "background-image: url('')",
        categories: [],
        cover:`/img/bnet/${appid}.jpg`,
        description: "",      
        tags: [],
        video:"",
      }
    } else if (fileInfo.fileName === 'World of Warcraft Public Test Real') {
      appid = 'wowptr'
      processName = ''
      meta = {
        app_name: "",
        background: "background-image: url('')",
        categories: [],
        cover:`/img/bnet/${appid}.jpg`,
        description: "",      
        tags: [],
        video:"",
      }
    }
    return {
      id: nodeKey,
      appid: appid,
      origin: 'bnet',
      exe: exec,
      game: meta,
      analytic: {
        played: 0,
        stat: [],
        launched: 0
      },
      name: fileInfo.fileName,
      label: fileInfo.fileName,
      nodeKey: nodeKey,
      expandable: fileInfo.isDir,
      tickable: true,
      lazy: true,
      children: [],
      data: {
        rootDir: fileInfo.rootDir,
        isDir: fileInfo.isDir,
        process: processName,
        mimeType: mimeType,
        stat: fileInfo.stat
      }
    }
  } else {
    log.error('Not a battle.net game')
    return
  }
}

export default fnCreateBnetNode
