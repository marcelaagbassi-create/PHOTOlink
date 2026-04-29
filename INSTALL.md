# PHOTOlink — Installation PWA

## 📱 Comment installer sur Android (sans Play Store)

### Méthode 1 : Installer depuis Chrome
1. Ouvre **Chrome** sur ton téléphone Android
2. Navigue vers le fichier `PHOTOLINK.html` (ou héberge-le sur un serveur)
3. Chrome affichera automatiquement **"Ajouter à l'écran d'accueil"**
4. Appuie dessus → **Installer** → PHOTOlink s'installe comme une vraie app !

### Méthode 2 : Héberger gratuitement sur Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Copie PHOTOLINK.html, manifest.json, sw.js, icon-192.png, icon-512.png
firebase deploy
```
Ton app sera disponible sur `https://TON_PROJET.web.app`

### Méthode 3 : Héberger sur GitHub Pages (gratuit)
1. Crée un repo GitHub
2. Upload tous les fichiers (PHOTOLINK.html, manifest.json, sw.js, icons)
3. Active GitHub Pages dans Settings
4. Ouvre l'URL sur Chrome Android → Installe !

## 📁 Fichiers requis (tous dans le même dossier)
- `PHOTOLINK.html` — Application principale
- `manifest.json` — Manifest PWA
- `sw.js` — Service Worker (offline)
- `icon-192.png` — Icône 192x192
- `icon-512.png` — Icône 512x512

## ✅ Fonctionnalités PWA
- ✅ Installation sur l'écran d'accueil
- ✅ Mode plein écran (sans barre de navigateur)
- ✅ Fonctionne HORS-LIGNE (mode démo sans Firebase)
- ✅ Cache intelligent des ressources
- ✅ Notifications push (si configurées)
- ✅ Icône personnalisée PHOTOlink

## 🔧 Pour la version React Native Android
La version React Native sera développée séparément avec :
- Expo / React Native CLI
- SQLite local (pas besoin d'internet pour l'auth)
- Firebase optionnel (sync en arrière-plan)
- APK installable directement
