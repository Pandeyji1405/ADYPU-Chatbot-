import './globals.css';

export const metadata = {
  title: 'ADYPU Futuristic Multilingual Chatbot',
  description: 'Examiner-ready multilingual RAG assistant for Ajeenkya DY Patil University.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
