import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { BackendHealthService } from './services/backend-health.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent implements OnInit, OnDestroy {
  
  // Typing animation properties
  typingWords = ['Scripts.', 'Novels.', 'Comics.', 'Screenplays.', 'Short Stories.', 'Series.'];
  currentTypingText = '';
  currentWordIndex = 0;
  currentCharIndex = 0;
  isDeleting = false;
  showCursor = true;
  typingSpeed = 100;
  deletingSpeed = 50;
  pauseTime = 2000;
  
  // FAQ data
  faqs = [
    {
      question: 'Is this just a project?',
      answer: 'This version is a project, but an upcoming new version is coming soon, for use.',
      isOpen: false
    },
    {
      question: 'Are you looking for investment?',
      answer: 'Yes, but I am looking for connections first.',
      isOpen: false
    },
    {
      question: 'Is this a joke?',
      answer: 'If you find it funny then use our app to write and expand on it.',
      isOpen: false
    }
  ];
  
  // Backend loading state
  isBackendLoading = true;
  
  private typingInterval: any;
  private cursorInterval: any;
  private subs = new Subscription();

  constructor(private backendHealthService: BackendHealthService) {}

  ngOnInit() {
    this.checkBackendHealth();
    this.startTypingAnimation();
    this.startCursorBlink();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
    if (this.cursorInterval) {
      clearInterval(this.cursorInterval);
    }
  }

  private checkBackendHealth() {
    // Try to check backend health, fallback to simulation
    this.subs.add(
      this.backendHealthService.checkBackendHealth().subscribe({
        next: (response) => {
          console.log('Backend is ready:', response);
          this.isBackendLoading = false;
        },
        error: (error) => {
          console.log('Backend health check failed, using simulation:', error);
          // Fallback to simulation
          this.subs.add(
            this.backendHealthService.simulateBackendWakeup().subscribe({
              next: (response) => {
                console.log('Backend simulation complete:', response);
                this.isBackendLoading = false;
              }
            })
          );
        }
      })
    );
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.updateParallax();
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  private updateParallax() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.parallax-image');
    
    parallaxElements.forEach((element: any) => {
      const speed = 0.5;
      const yPos = -(scrolled * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  }

  private startTypingAnimation() {
    this.typingInterval = setInterval(() => {
      const currentWord = this.typingWords[this.currentWordIndex];
      
      if (!this.isDeleting) {
        // Typing
        this.currentTypingText = currentWord.substring(0, this.currentCharIndex + 1);
        this.currentCharIndex++;
        
        if (this.currentCharIndex === currentWord.length) {
          // Word complete, pause then start deleting
          setTimeout(() => {
            this.isDeleting = true;
          }, this.pauseTime);
        }
      } else {
        // Deleting
        this.currentTypingText = currentWord.substring(0, this.currentCharIndex - 1);
        this.currentCharIndex--;
        
        if (this.currentCharIndex === 0) {
          // Word deleted, move to next word
          this.isDeleting = false;
          this.currentWordIndex = (this.currentWordIndex + 1) % this.typingWords.length;
        }
      }
    }, this.isDeleting ? this.deletingSpeed : this.typingSpeed);
  }

  private startCursorBlink() {
    this.cursorInterval = setInterval(() => {
      this.showCursor = !this.showCursor;
    }, 500);
  }

  toggleFaq(faq: any) {
    faq.isOpen = !faq.isOpen;
    
    // Close other FAQs (optional - remove if you want multiple open)
    this.faqs.forEach(item => {
      if (item !== faq) {
        item.isOpen = false;
      }
    });
  }
}