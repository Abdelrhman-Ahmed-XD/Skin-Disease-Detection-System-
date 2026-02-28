import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function ReportsPage() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Title */}
        <Text style={styles.mainTitle}>Skin Disease Detection App</Text>
        <Text style={styles.mainSubtitle}>Using Artificial Intelligence</Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Section: Introduction */}
        <Section title="Introduction">
          In the age of advanced technology and artificial intelligence, we can now benefit from these modern technologies in the medical field in unprecedented ways. The Skin Disease Detection App is one of the most prominent smart medical applications that aims to help both patients and doctors diagnose skin diseases quickly and with high accuracy. This application relies on advanced technologies in image processing and deep learning to identify a wide range of skin diseases.
        </Section>

        {/* Section: App Concept */}
        <Section title="App Concept">
          The basic idea of the application is to enable the user to take a picture of the affected skin area using their mobile phone camera. The application then automatically analyzes this image and identifies the type of skin disease likely present. The application provides a comprehensive report that includes the name of the likely disease, the confidence level of the diagnosis, along with useful medical information about the disease and its treatment methods.
        </Section>

        {/* Section: App Objectives */}
        <Section title="App Objectives">
          The application seeks to achieve a number of key objectives, most notably providing easy and quick access to primary medical diagnostic services in areas suffering from a shortage of medical personnel specializing in dermatology. It also aims to reduce the costs associated with routine medical visits and to raise users' awareness of common skin diseases and how to prevent them. Furthermore, the app helps doctors obtain quick second opinions to support their diagnostic decisions, while always emphasizing the necessity of consulting a specialist for a final diagnosis.
        </Section>

        {/* Section: Target Audiences */}
        <Section title="Target Audiences">
          The app targets a wide range of users, primarily patients with skin problems who want a quick initial assessment before visiting a doctor. It also serves general practitioners who need additional diagnostic support in the field of dermatology, as well as dermatologists themselves who can benefit from the app as a helpful tool in their practice. The app's reach extends to pharmacists and nurses who frequently encounter patients' questions about skin diseases.
        </Section>

        {/* Section: Key Features */}
        <Text style={styles.sectionTitle}>Key Features of the App</Text>

        <FeatureCard
          icon="camera-outline"
          title="Smart Diagnosis with Images"
          description="The app allows users to take a picture directly with the camera or select one from their phone's gallery. Artificial intelligence algorithms process the image within seconds, providing diagnostic results with a confidence level for each possible diagnosis, along with a list of the closest possible diseases similar to the patient's condition."
        />

        <FeatureCard
          icon="library-outline"
          title="Comprehensive Medical Database"
          description="The application contains a rich medical database that includes detailed information on more than one hundred skin diseases, including the causes, symptoms, and complications of each disease, along with available treatment methods and approved medical recommendations."
        />

        <FeatureCard
          icon="trending-up-outline"
          title="Monitoring Condition Progress"
          description="The monitoring feature allows users to document their skin condition over time. They can store multiple images of the affected area and track its response to treatment, while receiving alerts and reminders for treatment appointments and follow-up appointments."
        />

        <FeatureCard
          icon="people-outline"
          title="Connecting with Doctors"
          description="The application provides a platform for direct communication with dermatologists through an online medical consultation system. Users can share initial diagnostic results with the doctor and receive their guidance, saving time for both the patient and the doctor."
        />

        {/* Section: Technologies */}
        <Section title="Technologies Used">
          The application relies on an integrated system of advanced technologies, most notably deep learning techniques using convolutional neural networks trained on massive datasets containing millions of categorized skin images. The application also utilizes natural image processing techniques to automatically enhance the quality of captured images before analysis.{'\n\n'}The AI models used in the application have undergone intensive training under the supervision of a team of dermatologists, ensuring high accuracy in diagnostic results. The application works efficiently on both iOS and Android operating systems, with web access also available for maximum inclusivity.
        </Section>

        {/* Section: Detected Diseases */}
        <Section title="Diseases Detected by the Application">
          The application can detect a wide range of common and rare skin diseases. Among the most prominent diseases it addresses are eczema, psoriasis, various types of skin allergies, warts, blisters, and rashes caused by viral or bacterial infections. The detection range extends to moles and skin formations that may contain indicators of benign or malignant skin tumors, as well as recurrent acne and its marks that require specialized monitoring and treatment.
        </Section>

        {/* Section: Privacy */}
        <Section title="Privacy and Security">
          Recognizing the extreme sensitivity of medical data, the application adheres to the highest security and privacy standards in handling users' personal information. All images and medical data are stored encrypted on secure servers and are not shared with any third parties without the user's explicit consent. The application complies with international laws and regulations related to health data protection, such as the HIPAA law in the United States and similar legislation in other countries.
        </Section>

        {/* Section: Challenges */}
        <Section title="Challenges and Limitations">
          Despite the application's promising potential, several challenges and limitations should be considered. Technically, the accuracy of the diagnosis is affected by the quality of the captured image, the intensity of the ambient lighting, and its clarity. Furthermore, like any artificial intelligence system, the application is not without the possibility of diagnostic errors, especially in unusual or rare skin conditions. From a medical perspective, it is crucial to emphasize that the application is not a substitute for a specialist doctor's consultation.
        </Section>

        {/* Bottom spacing */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Reusable Section Component ───────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{children}</Text>
    </View>
  );
}

// ─── Reusable Feature Card Component ──────────────────────────────────────────
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureIconWrapper}>
        <Ionicons name={icon as any} size={22} color="#2A7DA0" />
      </View>
      <View style={styles.featureTextWrapper}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D8E9F0',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    margin: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  // Main Title Block
  mainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 8,
  },
  mainSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2A7DA0',
    textAlign: 'center',
    marginTop: 4,
  },
  divider: {
    height: 2,
    backgroundColor: '#2A7DA0',
    borderRadius: 2,
    marginVertical: 16,
    opacity: 0.3,
  },

  // Generic Section
  section: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionBody: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },

  // Feature Card
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    alignItems: 'flex-start',
  },
  featureIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 11,
    backgroundColor: '#E8F4FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  featureTextWrapper: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
});