import React, { useState, useEffect, useCallback } from 'react';
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Share,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { BORDER_RADIUS, COLORS } from '../constants/colors';
import { useUser } from '../context/UserContext';
import { communityAPI } from '../services/api';

type RootTabParamList = {
  Community: undefined;
};

type CommunityScreenProps = BottomTabScreenProps<RootTabParamList, 'Community'>;

export const CommunityScreen: React.FC<CommunityScreenProps> = () => {
  const insets = useSafeAreaInsets();
  const { profile } = useUser();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [posting, setPosting] = useState(false);

  const [selectedPostForComments, setSelectedPostForComments] = useState<any | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await communityAPI.getPosts();
      setPosts(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, []);

  // Post Submission
  const handleCreatePost = async () => {
    if (newPostText.trim().length === 0) return;
    setPosting(true);
    try {
      await communityAPI.createPost(newPostText.trim());
      setNewPostText('');
      fetchPosts();
    } catch (e) {
      console.error(e);
      alert('Failed to post review');
    } finally {
      setPosting(false);
    }
  };

  // Like Logic
  const handleLike = async (postId: string) => {
    try {
      await communityAPI.likePost(postId);
      fetchPosts();
    } catch (e) {
      console.error(e);
    }
  };

  // Share Logic
  const handleShare = async (content: string) => {
    try {
      await Share.share({
        message: content,
      });
    } catch (error) {
      console.log('Error sharing post:', error);
    }
  };

  // Add Comment Logic
  const handleAddComment = async () => {
    if (!selectedPostForComments || newCommentText.trim().length === 0) return;
    setCommenting(true);
    try {
      const postId = selectedPostForComments._id;
      const res = await communityAPI.commentPost(postId, newCommentText.trim());
      setNewCommentText('');
      
      // Update selected post state to reflect new comment list
      const updatedPost = res.data.data;
      setSelectedPostForComments(updatedPost);
      
      fetchPosts();
    } catch (e) {
      console.error(e);
      alert('Failed to add comment');
    } finally {
      setCommenting(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const formatTime = (date: string) => {
    if (!date) return 'Just now';
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return `Just now`;
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
      <ActivityIndicator size="large" color="#F5A623" />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <LinearGradient 
        colors={COLORS.gradient} 
        style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 12 : 24 }]}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Community Feed</Text>
        </View>
      </LinearGradient>

      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F5A623']} />}
        ListHeaderComponent={
          <View style={styles.createPostCard}>
            <View style={styles.createPostHeader}>
              <View style={styles.createPostAvatar}>
                <Text style={styles.createPostAvatarText}>
                  {getInitials(profile?.name || 'User')}
                </Text>
              </View>
              <Text style={styles.createPostTitle}>Share Your Experience</Text>
            </View>
            <TextInput
              style={styles.createPostInput}
              placeholder="How was your spiritual consultation or reading? Share a review..."
              placeholderTextColor={COLORS.textHint}
              value={newPostText}
              onChangeText={setNewPostText}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity
              style={[
                styles.submitPostButton,
                (newPostText.trim().length === 0 || posting) && styles.submitPostButtonDisabled,
              ]}
              onPress={handleCreatePost}
              disabled={newPostText.trim().length === 0 || posting}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={newPostText.trim().length === 0 ? ['#E0E0E0', '#D6D6D6'] : COLORS.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitPostButtonGradient}
              >
                <Text style={styles.submitPostButtonText}>
                  {posting ? 'Posting...' : 'Post Review'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.authorAvatar}>
                <Text style={styles.authorAvatarText}>
                  {getInitials(item.authorId?.name || item.authorName || 'Anonymous')}
                </Text>
              </View>
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>
                  {item.authorId?.name || item.authorName || 'Anonymous'}
                </Text>
                <Text style={styles.postTime}>{formatTime(item.createdAt)}</Text>
              </View>
            </View>

            <Text style={styles.postContent}>{item.content}</Text>

            <View style={styles.postFooter}>
              <TouchableOpacity 
                style={styles.footerItem} 
                onPress={() => handleLike(item._id)}
                activeOpacity={0.7}
              >
                <Text style={styles.footerIcon}>❤️</Text>
                <Text style={styles.footerText}>
                  {item.likes?.length || 0} Likes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.footerItem} 
                onPress={() => setSelectedPostForComments(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.footerIcon}>💬</Text>
                <Text style={styles.footerText}>
                  {item.comments?.length || 0} Comments
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.footerItem} 
                onPress={() => handleShare(item.content)}
                activeOpacity={0.7}
              >
                <Text style={styles.footerIcon}>↗️</Text>
                <Text style={styles.footerText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>👥</Text>
            <Text style={styles.emptyStateText}>No posts yet</Text>
          </View>
        }
      />

      {/* Interactive Comments Modal */}
      <Modal
        visible={selectedPostForComments !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedPostForComments(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reviews & Comments</Text>
              <TouchableOpacity
                onPress={() => setSelectedPostForComments(null)}
                style={styles.closeModalButton}
                activeOpacity={0.7}
              >
                <Feather name="x" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Post Preview inside Modal */}
            {selectedPostForComments ? (
              <View style={styles.postPreview}>
                <View style={styles.previewAuthorRow}>
                  <Text style={styles.previewAvatar}>
                    {getInitials(selectedPostForComments.authorId?.name || selectedPostForComments.authorName || 'Anonymous')}
                  </Text>
                  <Text style={styles.previewAuthor}>
                    {selectedPostForComments.authorId?.name || selectedPostForComments.authorName || 'Anonymous'}
                  </Text>
                </View>
                <Text style={styles.previewText}>{selectedPostForComments.content}</Text>
              </View>
            ) : null}

            {/* Comments List */}
            <FlatList
              data={selectedPostForComments ? (selectedPostForComments.comments || []) : []}
              keyExtractor={(item, index) => item._id || index.toString()}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>
                      {getInitials(item.name || 'Anonymous')}
                    </Text>
                  </View>
                  <View style={styles.commentBody}>
                    <View style={styles.commentAuthorRow}>
                      <Text style={styles.commentAuthor}>{item.name || 'Anonymous'}</Text>
                      <Text style={styles.commentTime}>{formatTime(item.createdAt)}</Text>
                    </View>
                    <Text style={styles.commentText}>{item.text}</Text>
                  </View>
                </View>
              )}
              contentContainerStyle={styles.commentsListContent}
              ListEmptyComponent={
                <View style={styles.emptyComments}>
                  <Text style={styles.emptyCommentsIcon}>💬</Text>
                  <Text style={styles.emptyCommentsText}>No comments yet</Text>
                  <Text style={styles.emptyCommentsSubtext}>Add a comment to share your opinion!</Text>
                </View>
              }
            />

            {/* Comment Form Section */}
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                placeholderTextColor={COLORS.textHint}
                value={newCommentText}
                onChangeText={setNewCommentText}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.sendCommentButton,
                  (newCommentText.trim().length === 0 || commenting) && styles.sendCommentButtonDisabled,
                ]}
                onPress={handleAddComment}
                disabled={newCommentText.trim().length === 0 || commenting}
                activeOpacity={0.7}
              >
                <Feather name="send" size={18} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  listContent: {
    padding: 16,
    paddingBottom: 120, // Clean overlap padding for floating navigation tab
  },
  createPostCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  createPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  createPostAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF0D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createPostAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  createPostTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  createPostInput: {
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.card - 4,
    padding: 12,
    height: 80,
    fontSize: 13,
    color: COLORS.textPrimary,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  submitPostButton: {
    borderRadius: BORDER_RADIUS.button,
    overflow: 'hidden',
    height: 40,
  },
  submitPostButtonDisabled: {
    opacity: 0.7,
  },
  submitPostButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitPostButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.card,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  postTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  postContent: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.borderLight,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  footerIcon: {
    fontSize: 14,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '75%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeModalButton: {
    padding: 4,
  },
  postPreview: {
    backgroundColor: COLORS.lightGray,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: BORDER_RADIUS.card - 4,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  previewAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  previewAvatar: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    backgroundColor: '#FFF0D6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  previewAuthor: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  previewText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  commentsListContent: {
    padding: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF0D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  commentBody: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 10,
  },
  commentAuthorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  commentTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  commentText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  emptyComments: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyCommentsIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyCommentsText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  emptyCommentsSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    backgroundColor: COLORS.white,
    gap: 10,
  },
  commentInput: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  sendCommentButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendCommentButtonDisabled: {
    backgroundColor: COLORS.textHint,
  },
});
