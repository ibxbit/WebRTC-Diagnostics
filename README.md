 # WebRTC Diagnostics & Debugging Suite  

A modern, professional web app for diagnosing and debugging WebRTC issues. Instantly check device access, network connectivity, and real-time call quality. Visualize metrics, log events, and get actionable troubleshooting tips all in one place. 

## Features    
- Device check (microphone, camera, speakers, permissions)     
- STUN connectivity test (ICE candidates, network path types)     
- Real-time stats: bitrate, packet loss, jitter, RTT (with live charts)           
- Advanced stats: codecs, bandwidth estimation, ICE details          
- Export results (JSON, CSV) and copy to clipboard                     
- Responsive, accessible, dark/light mode UI                
- SEO and social sharing optimized    
                         
## Live Demo                   
[https://webrtc-diagnostics.vercel.app/](https://webrtc-diagnostics.vercel.app/)                     
                    
## Getting Started                               
        
### Prerequisites                    
- Node.js (v18+ recommended)                         
- npm                      
          
### Setup               
```bash       
npm install             
npm run dev      
```  
Visit [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production 
```bash
npm run build
npm run preview
```

## Deployment
### Vercel (Recommended)
1. Push your code to GitHub.
2. Go to [vercel.com](https://vercel.com/), import your repo, and deploy.

### Netlify
1. Push your code to GitHub.
2. Go to [netlify.com](https://netlify.com/), import your repo, set build command to `npm run build` and publish directory to `dist`.

## License
MIT
