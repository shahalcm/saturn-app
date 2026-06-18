import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import api from '../services/api';
import { COLORS } from '../constants/colors';
import { useTranslation } from '../context/LanguageContext';

const CATEGORIES = [
  { value: 'payment_issue', label: 'Payment Issue', icon: 'card-outline' as const },
  { value: 'session_issue', label: 'Session Issue', icon: 'videocam-outline' as const },
  { value: 'provider_complaint', label: 'Provider Complaint', icon: 'person-outline' as const },
  { value: 'technical_issue', label: 'Technical Issue', icon: 'settings-outline' as const },
  { value: 'refund_request', label: 'Refund Request', icon: 'return-down-back-outline' as const },
  { value: 'account_issue', label: 'Account Issue', icon: 'lock-closed-outline' as const },
  { value: 'other', label: 'Other', icon: 'help-circle-outline' as const },
];

export default function CustomerCareScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const { profile } = useUser();
  const { t } = useTranslation();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('other');
  const [loading, setLoading] = useState(false);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'new' | 'tickets'>('new');
  const [successModal, setSuccessModal] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<any>(null);

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const fetchMyTickets = async () => {
    try {
      const res = await api.get('/api/support/tickets/my');
      setMyTickets(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!subject.trim()) {
      Alert.alert(t('common.required'), t('customerCare.subjectPlaceholder'));
      return;
    }
    if (!message.trim() || message.trim().length < 20) {
      Alert.alert(t('common.required'), t('customerCare.complaintPlaceholder'));
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/support/tickets', {
        subject: subject.trim(),
        message: message.trim(),
        category: selectedCategory,
        userType: 'seeker',
      });

      setCreatedTicket(res.data.data);
      setSuccessModal(true);
      setSubject('');
      setMessage('');
      setSelectedCategory('other');
      fetchMyTickets();
    } catch (e) {
      Alert.alert(t('common.error'), 'Failed to submit ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    Linking.openURL('tel:9544755008');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:ubsimportingexporting@gmail.com?subject=Saturn Support');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/919544755008?text=Hello, I need support with Saturn app.');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return { bg: '#FFF9E6', text: '#F5A623' };
      case 'in_progress': return { bg: '#E8F0FF', text: '#1A6BF5' };
      case 'resolved': return { bg: '#E8F5E9', text: '#4CAF50' };
      case 'closed': return { bg: '#F5F5F5', text: '#999999' };
      default: return { bg: '#F5F5F5', text: '#999999' };
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      {/* HEADER */}
      <LinearGradient
        colors={['#F5A623', '#E8841A']}
        style={{
          paddingTop: insets.top + 12,
          paddingBottom: 16,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: 'white' }}>
            {t('customerCare.title')}
          </Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 1 }}>
            {t('customerCare.subtitle')}
          </Text>
        </View>
        <Ionicons name="headset-outline" size={26} color="white" />
      </LinearGradient>

      {/* TABS */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: '#F0F0F0',
        gap: 8,
      }}>
        {[
          { key: 'new' as const, label: t('customerCare.newComplaint') },
          { key: 'tickets' as const, label: `${t('customerCare.myTickets')} (${myTickets.length})` },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 20,
              alignItems: 'center',
              backgroundColor: activeTab === tab.key ? '#F5A623' : '#F5F5F5',
            }}
          >
            <Text style={{
              fontSize: 13,
              fontWeight: '600',
              color: activeTab === tab.key ? 'white' : '#666',
            }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {activeTab === 'new' ? (
            <View style={{ padding: 16 }}>

              {/* CONTACT OPTIONS */}
              <View style={{
                backgroundColor: 'white',
                borderRadius: 20,
                padding: 16,
                marginBottom: 16,
              }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 14 }}>
                  {t('customerCare.contactDirectly')}
                </Text>

                {/* Call */}
                <TouchableOpacity
                  onPress={handleCall}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                    paddingVertical: 14,
                    borderBottomWidth: 0.5,
                    borderBottomColor: '#F0F0F0',
                  }}
                >
                  <View style={{
                    width: 46, height: 46, borderRadius: 23,
                    backgroundColor: '#E8F5E9',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Ionicons name="call" size={22} color="#4CAF50" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#1A1A1A' }}>
                      {t('customerCare.callUs')}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
                      +91 9544755008
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#AAAAAA" />
                </TouchableOpacity>

                {/* WhatsApp */}
                <TouchableOpacity
                  onPress={handleWhatsApp}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                    paddingVertical: 14,
                    borderBottomWidth: 0.5,
                    borderBottomColor: '#F0F0F0',
                  }}
                >
                  <View style={{
                    width: 46, height: 46, borderRadius: 23,
                    backgroundColor: '#E8F5E9',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#1A1A1A' }}>
                      {t('customerCare.whatsapp')}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
                      Chat with us on WhatsApp
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#AAAAAA" />
                </TouchableOpacity>

                {/* Email */}
                <TouchableOpacity
                  onPress={handleEmail}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                    paddingVertical: 14,
                  }}
                >
                  <View style={{
                    width: 46, height: 46, borderRadius: 23,
                    backgroundColor: '#E8F0FF',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Ionicons name="mail" size={22} color="#1A6BF5" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#1A1A1A' }}>
                      {t('customerCare.emailUs')}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
                      ubsimportingexporting@gmail.com
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#AAAAAA" />
                </TouchableOpacity>
              </View>

              {/* WORKING HOURS */}
              <View style={{
                backgroundColor: '#FFF9E6',
                borderRadius: 16,
                padding: 14,
                marginBottom: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                borderWidth: 1,
                borderColor: '#FFE4A0',
              }}>
                <Ionicons name="time-outline" size={20} color="#F5A623" />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#1A1A1A' }}>
                    {t('customerCare.supportHours')}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                    {t('customerCare.supportHoursDetail')}
                  </Text>
                </View>
              </View>

              {/* COMPLAINT FORM */}
              <View style={{
                backgroundColor: 'white',
                borderRadius: 20,
                padding: 16,
              }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 16 }}>
                  {t('customerCare.submitComplaint')}
                </Text>

                {/* Category selector */}
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 8 }}>
                  {t('customerCare.category')}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8, marginBottom: 16 }}
                >
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat.value}
                      onPress={() => setSelectedCategory(cat.value)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        paddingVertical: 8,
                        paddingHorizontal: 14,
                        borderRadius: 20,
                        borderWidth: 1.5,
                        backgroundColor: selectedCategory === cat.value ? '#F5A623' : 'white',
                        borderColor: selectedCategory === cat.value ? '#F5A623' : '#E0E0E0',
                      }}
                    >
                      <Ionicons
                        name={cat.icon}
                        size={14}
                        color={selectedCategory === cat.value ? 'white' : '#666'}
                      />
                      <Text style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: selectedCategory === cat.value ? 'white' : '#666',
                      }}>
                        {t(`categories.${cat.value}`)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Subject */}
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 8 }}>
                  {t('customerCare.subject')}
                </Text>
                <TextInput
                  value={subject}
                  onChangeText={setSubject}
                  placeholder={t('customerCare.subjectPlaceholder')}
                  placeholderTextColor="#AAAAAA"
                  maxLength={100}
                  style={{
                    borderWidth: 1.5,
                    borderColor: subject ? '#F5A623' : '#E0E0E0',
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 14,
                    color: '#1A1A1A',
                    marginBottom: 4,
                  }}
                />
                <Text style={{ fontSize: 11, color: '#AAAAAA', textAlign: 'right', marginBottom: 16 }}>
                  {subject.length}/100
                </Text>

                {/* Message */}
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 8 }}>
                  {t('customerCare.complaintDetail')}
                </Text>
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder={t('customerCare.complaintPlaceholder')}
                  placeholderTextColor="#AAAAAA"
                  multiline
                  numberOfLines={6}
                  maxLength={1000}
                  textAlignVertical="top"
                  style={{
                    borderWidth: 1.5,
                    borderColor: message ? '#F5A623' : '#E0E0E0',
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 14,
                    color: '#1A1A1A',
                    height: 140,
                    marginBottom: 4,
                  }}
                />
                <Text style={{ fontSize: 11, color: '#AAAAAA', textAlign: 'right', marginBottom: 20 }}>
                  {message.length}/1000
                </Text>

                {/* User info display */}
                <View style={{
                  backgroundColor: '#F5F5F5',
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}>
                  <Ionicons name="person-circle-outline" size={20} color="#F5A623" />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#1A1A1A' }}>
                      {profile?.name || 'Your Name'}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#666' }}>
                      {profile?.phone || ''} {profile?.email ? `• ${profile.email}` : ''}
                    </Text>
                  </View>
                </View>

                {/* Submit button */}
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  <LinearGradient
                    colors={['#F5A623', '#E8841A']}
                    style={{
                      borderRadius: 25,
                      height: 54,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                      gap: 8,
                    }}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <>
                        <Ionicons name="send" size={18} color="white" />
                        <Text style={{ fontSize: 16, fontWeight: '700', color: 'white' }}>
                          {t('customerCare.submitButton')}
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* MY TICKETS TAB */
            <View style={{ padding: 16 }}>
              {ticketsLoading ? (
                <ActivityIndicator color="#F5A623" style={{ marginTop: 40 }} />
              ) : myTickets.length === 0 ? (
                <View style={{ alignItems: 'center', paddingTop: 60 }}>
                  <Ionicons name="ticket-outline" size={60} color="#CCC" />
                  <Text style={{ color: '#999', marginTop: 12, fontSize: 15 }}>
                    {t('customerCare.noTickets')}
                  </Text>
                  <Text style={{ color: '#AAAAAA', marginTop: 6, fontSize: 13 }}>
                    {t('customerCare.noTicketsSubtitle')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setActiveTab('new')}
                    style={{ marginTop: 20 }}
                  >
                    <LinearGradient
                      colors={['#F5A623', '#E8841A']}
                      style={{ borderRadius: 20, paddingVertical: 10, paddingHorizontal: 24 }}
                    >
                      <Text style={{ color: 'white', fontWeight: '600' }}>
                        {t('customerCare.newComplaint')}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                myTickets.map(ticket => {
                  const statusStyle = getStatusColor(ticket.status);
                  return (
                    <View key={ticket._id} style={{
                      backgroundColor: 'white',
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 12,
                    }}>
                      {/* Ticket header */}
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 12, color: '#F5A623', fontWeight: '600' }}>
                            #{ticket.ticketNumber}
                          </Text>
                          <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginTop: 2 }} numberOfLines={1}>
                            {ticket.subject}
                          </Text>
                        </View>
                        <View style={{
                          backgroundColor: statusStyle.bg,
                          borderRadius: 10,
                          paddingVertical: 3,
                          paddingHorizontal: 10,
                          marginLeft: 8,
                        }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: statusStyle.text }}>
                            {ticket.status.replace('_', ' ').toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      {/* Message preview */}
                      <Text style={{ fontSize: 13, color: '#666', lineHeight: 19 }} numberOfLines={2}>
                        {ticket.message}
                      </Text>

                      {/* Admin reply */}
                      {ticket.adminReply && (
                        <View style={{
                          backgroundColor: '#F0FFF4',
                          borderRadius: 10,
                          padding: 10,
                          marginTop: 10,
                          borderLeftWidth: 3,
                          borderLeftColor: '#4CAF50',
                        }}>
                          <Text style={{ fontSize: 11, fontWeight: '600', color: '#4CAF50', marginBottom: 4 }}>
                            Admin Reply:
                          </Text>
                          <Text style={{ fontSize: 13, color: '#1A1A1A', lineHeight: 18 }}>
                            {ticket.adminReply}
                          </Text>
                        </View>
                      )}

                      {/* Footer */}
                      <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 10,
                        paddingTop: 10,
                        borderTopWidth: 0.5,
                        borderTopColor: '#F0F0F0',
                      }}>
                        <Text style={{ fontSize: 12, color: '#AAAAAA' }}>
                          {formatDate(ticket.createdAt)}
                        </Text>
                        <View style={{
                          backgroundColor: '#FFF0D6',
                          borderRadius: 8,
                          paddingVertical: 3,
                          paddingHorizontal: 8,
                        }}>
                          <Text style={{ fontSize: 11, color: '#F5A623', fontWeight: '600' }}>
                            {t(`categories.${ticket.category}`)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* SUCCESS MODAL */}
      <Modal
        visible={successModal}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 24,
            padding: 28,
            alignItems: 'center',
            width: '100%',
          }}>
            <View style={{
              width: 80, height: 80, borderRadius: 40,
              backgroundColor: '#E8F5E9',
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Ionicons name="checkmark-circle" size={50} color="#4CAF50" />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '850', color: '#1A1A1A', marginBottom: 8 }}>
              {t('customerCare.ticketSubmitted')}
            </Text>
            {createdTicket && (
              <View style={{
                backgroundColor: '#FFF9E6',
                borderRadius: 12,
                padding: 12,
                marginBottom: 12,
                width: '100%',
                alignItems: 'center',
              }}>
                <Text style={{ fontSize: 13, color: '#666' }}>{t('customerCare.ticketNumber')}</Text>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#F5A623', marginTop: 4 }}>
                  #{createdTicket.ticketNumber}
                </Text>
              </View>
            )}
            <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 21, marginBottom: 20 }}>
              {t('customerCare.ticketDetailSubtitle')}
            </Text>
            <View style={{ width: '100%', gap: 10 }}>
              <TouchableOpacity
                onPress={() => {
                  setSuccessModal(false);
                  setActiveTab('tickets');
                }}
                style={{ width: '100%' }}
              >
                <LinearGradient
                  colors={['#F5A623', '#E8841A']}
                  style={{ borderRadius: 25, height: 48, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ fontSize: 15, fontWeight: '700', color: 'white' }}>
                    {t('customerCare.viewMyTickets')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSuccessModal(false)}
                style={{
                  height: 48, alignItems: 'center', justifyContent: 'center',
                  borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 25,
                }}
              >
                <Text style={{ fontSize: 15, color: '#666' }}>{t('common.close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
