import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';
import { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const GRADE_FILTERS = ['All', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8', 'Year 9', 'Year 10'];

export default function TeamsScreen({ navigation, route }) {
  const { teamName } = route?.params || {};
  const [myTeam, setMyTeam] = useState(null);
  const [allTeams, setAllTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Load my team
      const myDoc = await getDoc(doc(db, 'teams', user.uid));
      if (myDoc.exists()) setMyTeam(myDoc.data());

      // Load all teams
      const snapshot = await getDocs(collection(db, 'teams'));
      const teams = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(t => t.id !== user.uid); // exclude self
      setAllTeams(teams);
    } catch (error) {
      console.log('Teams load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = allTeams.filter(team => {
    const matchesGrade = gradeFilter === 'All' || team.grade === gradeFilter;
    const matchesSearch = search === '' ||
      team.teamName?.toLowerCase().includes(search.toLowerCase()) ||
      team.email?.toLowerCase().includes(search.toLowerCase()) ||
      team.members?.some(m => m.toLowerCase().includes(search.toLowerCase()));
    return matchesGrade && matchesSearch;
  });

  const handleInvite = (team) => {
    Alert.alert(
      `Invite ${team.teamName}?`,
      `Send a team-up invite to ${team.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Invite 📨', onPress: () => {
            Alert.alert('Invite Sent! 📨', `An invite has been sent to ${team.teamName}!`);
          }
        }
      ]
    );
  };

  return (
    <LinearGradient colors={['#4a90d9', '#1a3a5c']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.title}>👥 Teams</Text>
        <Text style={styles.subtitle}>Find and connect with other teams</Text>

        {/* My Team Card */}
        {myTeam && (
          <View style={styles.myTeamCard}>
            <Text style={styles.myTeamLabel}>YOUR TEAM</Text>

            {/* Avatar */}
            {myTeam.profilePictureUrl ? (
              <Image source={{ uri: myTeam.profilePictureUrl }} style={styles.myTeamAvatar} />
            ) : (
              <View style={styles.myTeamAvatarPlaceholder}>
                <Text style={styles.myTeamAvatarInitial}>
                  {(myTeam.teamName || 'T')[0].toUpperCase()}
                </Text>
              </View>
            )}

            <Text style={styles.myTeamName}>{myTeam.teamName}</Text>
            <Text style={styles.myTeamEmail}>{auth.currentUser?.email}</Text>

            {myTeam.grade && (
              <View style={styles.gradeBadge}>
                <Text style={styles.gradeBadgeText}>{myTeam.grade}</Text>
              </View>
            )}

            {myTeam.members?.length > 0 && (
              <View style={styles.membersRow}>
                {myTeam.members.map((m, i) => (
                  <View key={i} style={styles.memberChip}>
                    <Text style={styles.memberChipText}>{m}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Search */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by team name, email or member..."
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Grade filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterRow}
        >
          {GRADE_FILTERS.map(g => (
            <TouchableOpacity
              key={g}
              style={[styles.filterBtn, gradeFilter === g && styles.filterBtnActive]}
              onPress={() => setGradeFilter(g)}
            >
              <Text style={[styles.filterText, gradeFilter === g && styles.filterTextActive]}>
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Section header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {filteredTeams.length} {filteredTeams.length === 1 ? 'team' : 'teams'} found
          </Text>
        </View>

        {/* Loading */}
        {loading && <ActivityIndicator color="#fff" size="large" style={{ marginTop: 40 }} />}

        {/* Empty */}
        {!loading && filteredTeams.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>No teams found</Text>
            <Text style={styles.emptySubtext}>Try a different search or grade filter.</Text>
          </View>
        )}

        {/* Teams list */}
        {!loading && filteredTeams.map((team) => (
          <View key={team.id} style={styles.teamCard}>
            {/* Avatar */}
            {team.profilePictureUrl ? (
              <Image source={{ uri: team.profilePictureUrl }} style={styles.teamAvatar} />
            ) : (
              <View style={styles.teamAvatarPlaceholder}>
                <Text style={styles.teamAvatarInitial}>
                  {(team.teamName || 'T')[0].toUpperCase()}
                </Text>
              </View>
            )}

            {/* Info */}
            <View style={styles.teamInfo}>
              <Text style={styles.teamName}>{team.teamName || 'Unknown Team'}</Text>
              <Text style={styles.teamEmail}>{team.email || 'No email'}</Text>
              {team.grade && <Text style={styles.teamGrade}>🎓 {team.grade}</Text>}
              {team.members?.length > 0 && (
                <Text style={styles.teamMembers}>
                  👤 {team.members.join(', ')}
                </Text>
              )}
            </View>

            {/* Invite button */}
            <TouchableOpacity style={styles.inviteBtn} onPress={() => handleInvite(team)}>
              <Text style={styles.inviteBtnText}>Invite</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back to Home</Text>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { alignItems: 'center', paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#b0d4f1', marginBottom: 20 },

  // My team card
  myTeamCard: {
    width: '100%', backgroundColor: 'rgba(255,215,0,0.15)',
    borderRadius: 20, padding: 20, alignItems: 'center',
    marginBottom: 20, borderWidth: 2, borderColor: '#FFD700',
  },
  myTeamLabel: {
    fontSize: 11, fontWeight: 'bold', color: '#FFD700',
    letterSpacing: 2, marginBottom: 12,
  },
  myTeamAvatar: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 3, borderColor: '#FFD700', marginBottom: 10,
  },
  myTeamAvatarPlaceholder: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#FFD700', marginBottom: 10,
  },
  myTeamAvatarInitial: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  myTeamName: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  myTeamEmail: { fontSize: 13, color: '#b0d4f1', marginBottom: 8 },
  gradeBadge: {
    backgroundColor: 'rgba(255,215,0,0.2)', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 4, marginBottom: 10,
  },
  gradeBadgeText: { fontSize: 12, color: '#FFD700', fontWeight: 'bold' },
  membersRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  memberChip: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  memberChipText: { fontSize: 12, color: '#d0e8ff' },

  // Search
  searchBox: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10,
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#fff' },
  clearBtn: { fontSize: 14, color: '#b0d4f1', paddingLeft: 8 },

  // Filters
  filterScroll: { width: '100%', marginBottom: 16 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 4 },
  filterBtn: {
    paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  filterBtnActive: { backgroundColor: 'rgba(255,255,255,0.3)', borderColor: '#fff' },
  filterText: { fontSize: 13, color: '#b0d4f1' },
  filterTextActive: { color: '#fff', fontWeight: 'bold' },

  // Section header
  sectionHeader: {
    width: '100%', marginBottom: 12,
  },
  sectionTitle: { fontSize: 13, color: '#b0d4f1', fontWeight: 'bold' },

  // Empty
  emptyBox: { marginTop: 40, alignItems: 'center' },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#fff', fontWeight: 'bold', marginBottom: 6 },
  emptySubtext: { fontSize: 13, color: '#b0d4f1', textAlign: 'center' },

  // Team cards
  teamCard: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  teamAvatar: {
    width: 50, height: 50, borderRadius: 25,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
    marginRight: 12,
  },
  teamAvatarPlaceholder: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
    marginRight: 12,
  },
  teamAvatarInitial: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  teamInfo: { flex: 1 },
  teamName: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  teamEmail: { fontSize: 12, color: '#b0d4f1', marginBottom: 2 },
  teamGrade: { fontSize: 11, color: '#ffe082', marginBottom: 2 },
  teamMembers: { fontSize: 11, color: '#d0e8ff' },
  inviteBtn: {
    backgroundColor: 'rgba(76,175,80,0.3)', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: '#4caf50',
  },
  inviteBtnText: { fontSize: 12, color: '#4caf50', fontWeight: 'bold' },

  // Back
  backButton: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25, paddingVertical: 14, alignItems: 'center',
    marginTop: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  backButtonText: { fontSize: 14, color: '#fff', letterSpacing: 1 },
});