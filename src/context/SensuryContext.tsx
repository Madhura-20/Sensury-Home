import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  isAdminAccount,
  OperationType,
} from '../lib/firebase';
import {
  AiConversation,
  ConstructionTask,
  DirectoryProfile,
  HomeProject,
  MaterialItem,
  ProductItem,
  ProgressUpdate,
  ProjectDocument,
  ProjectExpense,
  QuotationRequest,
  UserPrivateInfo,
  UserProfile,
} from '../types/sensury';
import {
  DEFAULT_DIRECTORY_PROFILES,
  DEFAULT_MATERIALS,
  DEFAULT_PRODUCTS,
} from '../data/referenceCatalog';

function makeId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${rand}`.replace(/[^a-zA-Z0-9_-]/g, '_');
}

interface SensuryContextValue {
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  profile: UserProfile | null;
  privateInfo: UserPrivateInfo | null;
  projects: HomeProject[];
  activeProject: HomeProject | null;
  setActiveProjectId: (projectId: string) => Promise<void>;
  tasks: ConstructionTask[];
  expenses: ProjectExpense[];
  progressUpdates: ProgressUpdate[];
  documents: ProjectDocument[];
  quotations: QuotationRequest[];
  conversations: AiConversation[];
  materials: MaterialItem[];
  products: ProductItem[];
  directoryProfiles: DirectoryProfile[];
  // Auth actions
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  // Profile actions
  updateUserProfile: (updates: {
    displayName?: string;
    preferredLanguage?: 'en' | 'ta';
    district?: string;
    phone?: string;
  }) => Promise<void>;
  toggleSavedMaterial: (materialId: string) => Promise<void>;
  // Project actions
  saveProject: (
    data: Omit<HomeProject, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => Promise<string>;
  updateProjectProgress: (
    projectId: string,
    currentStageNumber: number,
    completedStageNumbers: number[],
    status: HomeProject['status']
  ) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  // Tracker actions
  createTask: (
    task: Omit<ConstructionTask, 'id' | 'projectId' | 'ownerId' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateTaskStatus: (taskId: string, status: ConstructionTask['status']) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  createExpense: (
    expense: Omit<ProjectExpense, 'id' | 'projectId' | 'ownerId' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  createProgressUpdate: (
    update: Omit<ProgressUpdate, 'id' | 'projectId' | 'ownerId' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  deleteProgressUpdate: (updateId: string) => Promise<void>;
  createDocumentRecord: (
    docItem: Omit<ProjectDocument, 'id' | 'projectId' | 'ownerId' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateDocumentStatus: (docId: string, status: ProjectDocument['status']) => Promise<void>;
  deleteDocumentRecord: (docId: string) => Promise<void>;
  createQuotation: (
    quote: Omit<QuotationRequest, 'id' | 'projectId' | 'ownerId' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateQuotation: (
    quoteId: string,
    updates: Pick<QuotationRequest, 'providerName' | 'quotedAmountInr' | 'timelineWeeks' | 'status' | 'notes'>
  ) => Promise<void>;
  deleteQuotation: (quoteId: string) => Promise<void>;
  // AI Conversations
  saveConversation: (
    conv: Omit<AiConversation, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => Promise<string>;
  deleteConversation: (convId: string) => Promise<void>;
  // Admin actions
  upsertMaterial: (item: MaterialItem) => Promise<void>;
  upsertProduct: (item: ProductItem) => Promise<void>;
  upsertDirectoryProfile: (item: DirectoryProfile) => Promise<void>;
  seedStarterCatalogs: () => Promise<void>;
  submitPublicInquiry: (payload: {
    name: string;
    email: string;
    district: string;
    message: string;
  }) => Promise<void>;
}

const SensuryContext = createContext<SensuryContextValue | null>(null);

export function SensuryProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [privateInfo, setPrivateInfo] = useState<UserPrivateInfo | null>(null);
  const [projects, setProjects] = useState<HomeProject[]>([]);
  const [tasks, setTasks] = useState<ConstructionTask[]>([]);
  const [expenses, setExpenses] = useState<ProjectExpense[]>([]);
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([]);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [quotations, setQuotations] = useState<QuotationRequest[]>([]);
  const [conversations, setConversations] = useState<AiConversation[]>([]);

  const [dbMaterials, setDbMaterials] = useState<MaterialItem[]>([]);
  const [dbProducts, setDbProducts] = useState<ProductItem[]>([]);
  const [dbDirectory, setDbDirectory] = useState<DirectoryProfile[]>([]);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);

      if (firebaseUser && firebaseUser.emailVerified) {
        // Bootstrap profile & isolated private info if missing
        const userRef = doc(db, 'users', firebaseUser.uid);
        const privateRef = doc(db, 'users', firebaseUser.uid, 'private', 'info');
        try {
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            await setDoc(userRef, {
              uid: firebaseUser.uid,
              displayName: (firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Homeowner').slice(0, 100),
              preferredLanguage: 'en',
              district: 'Chennai',
              activeProjectId: '',
              savedMaterialIds: [],
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
          const privSnap = await getDoc(privateRef);
          if (!privSnap.exists()) {
            await setDoc(privateRef, {
              uid: firebaseUser.uid,
              email: (firebaseUser.email || '').slice(0, 160),
              phone: '',
              updatedAt: serverTimestamp(),
            });
          }
        } catch (err) {
          console.error('Profile bootstrap notice:', err);
        }
      } else {
        setProfile(null);
        setPrivateInfo(null);
        setProjects([]);
        setTasks([]);
        setExpenses([]);
        setProgressUpdates([]);
        setDocuments([]);
        setQuotations([]);
        setConversations([]);
      }
    });
    return () => unsub();
  }, []);

  // Public catalogs listeners (always available)
  useEffect(() => {
    const unsubMat = onSnapshot(
      collection(db, 'materials'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MaterialItem, 'id'>) }));
        setDbMaterials(list);
      },
      (err) => console.error('Materials snapshot error:', err)
    );
    const unsubProd = onSnapshot(
      collection(db, 'products'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProductItem, 'id'>) }));
        setDbProducts(list);
      },
      (err) => console.error('Products snapshot error:', err)
    );
    const unsubDir = onSnapshot(
      collection(db, 'directory_profiles'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<DirectoryProfile, 'id'>) }));
        setDbDirectory(list);
      },
      (err) => console.error('Directory snapshot error:', err)
    );
    return () => {
      unsubMat();
      unsubProd();
      unsubDir();
    };
  }, []);

  // Authenticated user data listeners
  useEffect(() => {
    if (!authReady || !user) return;

    const uid = user.uid;
    const unsubProfile = onSnapshot(
      doc(db, 'users', uid),
      (snap) => {
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, `users/${uid}`)
    );

    const unsubPrivate = onSnapshot(
      doc(db, 'users', uid, 'private', 'info'),
      (snap) => {
        if (snap.exists()) {
          setPrivateInfo(snap.data() as UserPrivateInfo);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, `users/${uid}/private/info`)
    );

    const projectsQuery = query(collection(db, 'projects'), where('ownerId', '==', uid));
    const unsubProjects = onSnapshot(
      projectsQuery,
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<HomeProject, 'id'>),
        }));
        list.sort((a, b) => (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0));
        setProjects(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'projects')
    );

    const convQuery = query(collection(db, 'ai_conversations'), where('ownerId', '==', uid));
    const unsubConvs = onSnapshot(
      convQuery,
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<AiConversation, 'id'>),
        }));
        list.sort((a, b) => (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0));
        setConversations(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'ai_conversations')
    );

    return () => {
      unsubProfile();
      unsubPrivate();
      unsubProjects();
      unsubConvs();
    };
  }, [authReady, user]);

  const activeProject = useMemo(() => {
    if (projects.length === 0) return null;
    if (profile?.activeProjectId) {
      const found = projects.find((p) => p.id === profile.activeProjectId);
      if (found) return found;
    }
    return projects[0];
  }, [projects, profile?.activeProjectId]);

  // Active project subcollection listeners
  useEffect(() => {
    if (!authReady || !user || !activeProject) {
      setTasks([]);
      setExpenses([]);
      setProgressUpdates([]);
      setDocuments([]);
      setQuotations([]);
      return;
    }

    const pid = activeProject.id;
    const uid = user.uid;

    const unsubTasks = onSnapshot(
      query(collection(db, 'projects', pid, 'tasks'), where('ownerId', '==', uid)),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ConstructionTask, 'id'>) }));
        list.sort((a, b) => a.stageNumber - b.stageNumber);
        setTasks(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `projects/${pid}/tasks`)
    );

    const unsubExpenses = onSnapshot(
      query(collection(db, 'projects', pid, 'expenses'), where('ownerId', '==', uid)),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProjectExpense, 'id'>) }));
        list.sort((a, b) => b.expenseDate.localeCompare(a.expenseDate));
        setExpenses(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `projects/${pid}/expenses`)
    );

    const unsubUpdates = onSnapshot(
      query(collection(db, 'projects', pid, 'progress_updates'), where('ownerId', '==', uid)),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProgressUpdate, 'id'>) }));
        list.sort((a, b) => b.updateDate.localeCompare(a.updateDate));
        setProgressUpdates(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `projects/${pid}/progress_updates`)
    );

    const unsubDocs = onSnapshot(
      query(collection(db, 'projects', pid, 'documents'), where('ownerId', '==', uid)),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProjectDocument, 'id'>) }));
        list.sort((a, b) => a.stageNumber - b.stageNumber);
        setDocuments(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `projects/${pid}/documents`)
    );

    const unsubQuotes = onSnapshot(
      query(collection(db, 'projects', pid, 'quotations'), where('ownerId', '==', uid)),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<QuotationRequest, 'id'>) }));
        list.sort((a, b) => (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0));
        setQuotations(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `projects/${pid}/quotations`)
    );

    return () => {
      unsubTasks();
      unsubExpenses();
      unsubUpdates();
      unsubDocs();
      unsubQuotes();
    };
  }, [authReady, user, activeProject?.id]);

  // Merge Firestore catalogs with reference fallback (Firestore entries override by id)
  const materials = useMemo(() => {
    const map = new Map<string, MaterialItem>();
    DEFAULT_MATERIALS.forEach((m) => map.set(m.id, m));
    dbMaterials.forEach((m) => map.set(m.id, m));
    return Array.from(map.values());
  }, [dbMaterials]);

  const products = useMemo(() => {
    const map = new Map<string, ProductItem>();
    DEFAULT_PRODUCTS.forEach((p) => map.set(p.id, p));
    dbProducts.forEach((p) => map.set(p.id, p));
    return Array.from(map.values());
  }, [dbProducts]);

  const directoryProfiles = useMemo(() => {
    const map = new Map<string, DirectoryProfile>();
    DEFAULT_DIRECTORY_PROFILES.forEach((d) => map.set(d.id, d));
    dbDirectory.forEach((d) => map.set(d.id, d));
    return Array.from(map.values());
  }, [dbDirectory]);

  const isAdmin = useMemo(() => isAdminAccount(user), [user]);

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const registerWithEmail = async (name: string, email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name.trim()) {
      await updateProfile(cred.user, { displayName: name.trim().slice(0, 100) });
    }
    await sendEmailVerification(cred.user);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const setActiveProjectId = async (projectId: string) => {
    if (!user || !profile) return;
    const path = `users/${user.uid}`;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        activeProjectId: projectId.slice(0, 128),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const updateUserProfile = async (updates: {
    displayName?: string;
    preferredLanguage?: 'en' | 'ta';
    district?: string;
    phone?: string;
  }) => {
    if (!user) return;
    try {
      const profileUpdate: Record<string, unknown> = { updatedAt: serverTimestamp() };
      if (updates.displayName !== undefined) {
        profileUpdate.displayName = updates.displayName.trim().slice(0, 100) || 'Homeowner';
      }
      if (updates.preferredLanguage !== undefined) {
        profileUpdate.preferredLanguage = updates.preferredLanguage;
      }
      if (updates.district !== undefined) {
        profileUpdate.district = updates.district.slice(0, 80);
      }
      await updateDoc(doc(db, 'users', user.uid), profileUpdate);

      if (updates.phone !== undefined) {
        await updateDoc(doc(db, 'users', user.uid, 'private', 'info'), {
          email: (user.email || privateInfo?.email || '').slice(0, 160),
          phone: updates.phone.trim().slice(0, 24),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const toggleSavedMaterial = async (materialId: string) => {
    if (!user || !profile) return;
    const current = profile.savedMaterialIds || [];
    const exists = current.includes(materialId);
    const next = exists
      ? current.filter((id) => id !== materialId)
      : [...current, materialId].slice(0, 50);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        savedMaterialIds: next,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const saveProject = async (
    data: Omit<HomeProject, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ): Promise<string> => {
    if (!user) throw new Error('Authentication required.');
    const projectId = existingId || makeId('proj');
    const docRef = doc(db, 'projects', projectId);

    const sanitized = {
      projectName: data.projectName.trim().slice(0, 120),
      landLocation: data.landLocation.trim().slice(0, 140),
      district: data.district.trim().slice(0, 80),
      plotLengthFt: Math.max(1, Math.min(5000, Number(data.plotLengthFt))),
      plotWidthFt: Math.max(1, Math.min(5000, Number(data.plotWidthFt))),
      plotAreaSqFt: Math.max(1, Math.min(500000, Number(data.plotAreaSqFt))),
      plotType: data.plotType,
      totalBudgetInr: Math.max(100000, Math.min(500000000, Number(data.totalBudgetInr))),
      floors: data.floors,
      bedrooms: Math.max(1, Math.min(12, Math.round(data.bedrooms))),
      bathrooms: Math.max(1, Math.min(12, Math.round(data.bathrooms))),
      kitchenType: data.kitchenType.trim().slice(0, 60),
      parkingType: data.parkingType.trim().slice(0, 60),
      houseStyle: data.houseStyle.trim().slice(0, 80),
      additionalPreferences: (data.additionalPreferences || '').trim().slice(0, 1000),
      builtUpAreaSqFt: Math.max(0, Math.min(200000, Number(data.builtUpAreaSqFt))),
      estimatedCostInr: Math.max(0, Math.min(500000000, Number(data.estimatedCostInr))),
      planningSummary: (data.planningSummary || '').slice(0, 8000),
    };

    try {
      if (existingId) {
        await updateDoc(docRef, {
          ...sanitized,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(docRef, {
          ownerId: user.uid,
          ...sanitized,
          currentStageNumber: Math.max(1, Math.min(18, Math.round(data.currentStageNumber || 1))),
          completedStageNumbers: (data.completedStageNumbers || []).slice(0, 18),
          status: data.status || 'planning',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await updateDoc(doc(db, 'users', user.uid), {
          activeProjectId: projectId,
          updatedAt: serverTimestamp(),
        });
      }
      return projectId;
    } catch (err) {
      handleFirestoreError(err, existingId ? OperationType.UPDATE : OperationType.CREATE, `projects/${projectId}`);
    }
  };

  const updateProjectProgress = async (
    projectId: string,
    currentStageNumber: number,
    completedStageNumbers: number[],
    status: HomeProject['status']
  ) => {
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        currentStageNumber: Math.max(1, Math.min(18, Math.round(currentStageNumber))),
        completedStageNumbers: completedStageNumbers.slice(0, 18),
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `projects/${projectId}`);
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      await deleteDoc(doc(db, 'projects', projectId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `projects/${projectId}`);
    }
  };

  const createTask = async (
    task: Omit<ConstructionTask, 'id' | 'projectId' | 'ownerId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!user || !activeProject) return;
    const taskId = makeId('task');
    const path = `projects/${activeProject.id}/tasks/${taskId}`;
    try {
      await setDoc(doc(db, 'projects', activeProject.id, 'tasks', taskId), {
        projectId: activeProject.id,
        ownerId: user.uid,
        stageNumber: Math.max(1, Math.min(18, Math.round(task.stageNumber))),
        title: task.title.trim().slice(0, 140),
        description: task.description.trim().slice(0, 1000),
        assignedRole: task.assignedRole.trim().slice(0, 80),
        dueDate: task.dueDate.trim().slice(0, 30),
        status: task.status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const updateTaskStatus = async (taskId: string, status: ConstructionTask['status']) => {
    if (!activeProject) return;
    const path = `projects/${activeProject.id}/tasks/${taskId}`;
    try {
      await updateDoc(doc(db, 'projects', activeProject.id, 'tasks', taskId), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!activeProject) return;
    const path = `projects/${activeProject.id}/tasks/${taskId}`;
    try {
      await deleteDoc(doc(db, 'projects', activeProject.id, 'tasks', taskId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const createExpense = async (
    expense: Omit<ProjectExpense, 'id' | 'projectId' | 'ownerId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!user || !activeProject) return;
    const expId = makeId('exp');
    const path = `projects/${activeProject.id}/expenses/${expId}`;
    try {
      await setDoc(doc(db, 'projects', activeProject.id, 'expenses', expId), {
        projectId: activeProject.id,
        ownerId: user.uid,
        stageNumber: Math.max(1, Math.min(18, Math.round(expense.stageNumber))),
        category: expense.category.trim().slice(0, 60),
        title: expense.title.trim().slice(0, 140),
        vendorName: expense.vendorName.trim().slice(0, 120),
        amountInr: Math.max(0, Math.min(500000000, Number(expense.amountInr))),
        paymentMode: expense.paymentMode.trim().slice(0, 40),
        expenseDate: expense.expenseDate.trim().slice(0, 30),
        notes: expense.notes.trim().slice(0, 500),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const deleteExpense = async (expenseId: string) => {
    if (!activeProject) return;
    const path = `projects/${activeProject.id}/expenses/${expenseId}`;
    try {
      await deleteDoc(doc(db, 'projects', activeProject.id, 'expenses', expenseId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const createProgressUpdate = async (
    update: Omit<ProgressUpdate, 'id' | 'projectId' | 'ownerId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!user || !activeProject) return;
    const updId = makeId('upd');
    const path = `projects/${activeProject.id}/progress_updates/${updId}`;
    try {
      await setDoc(doc(db, 'projects', activeProject.id, 'progress_updates', updId), {
        projectId: activeProject.id,
        ownerId: user.uid,
        stageNumber: Math.max(1, Math.min(18, Math.round(update.stageNumber))),
        title: update.title.trim().slice(0, 140),
        notes: update.notes.trim().slice(0, 2000),
        photoDataUrl: (update.photoDataUrl || '').slice(0, 350000),
        updateDate: update.updateDate.trim().slice(0, 30),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const deleteProgressUpdate = async (updateId: string) => {
    if (!activeProject) return;
    const path = `projects/${activeProject.id}/progress_updates/${updateId}`;
    try {
      await deleteDoc(doc(db, 'projects', activeProject.id, 'progress_updates', updateId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const createDocumentRecord = async (
    docItem: Omit<ProjectDocument, 'id' | 'projectId' | 'ownerId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!user || !activeProject) return;
    const docId = makeId('doc');
    const path = `projects/${activeProject.id}/documents/${docId}`;
    try {
      await setDoc(doc(db, 'projects', activeProject.id, 'documents', docId), {
        projectId: activeProject.id,
        ownerId: user.uid,
        category: docItem.category.trim().slice(0, 80),
        title: docItem.title.trim().slice(0, 140),
        stageNumber: Math.max(1, Math.min(18, Math.round(docItem.stageNumber))),
        status: docItem.status,
        fileName: (docItem.fileName || '').slice(0, 180),
        fileType: (docItem.fileType || '').slice(0, 80),
        fileDataUrl: (docItem.fileDataUrl || '').slice(0, 450000),
        notes: (docItem.notes || '').trim().slice(0, 1000),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const updateDocumentStatus = async (docId: string, status: ProjectDocument['status']) => {
    if (!activeProject) return;
    const path = `projects/${activeProject.id}/documents/${docId}`;
    try {
      await updateDoc(doc(db, 'projects', activeProject.id, 'documents', docId), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteDocumentRecord = async (docId: string) => {
    if (!activeProject) return;
    const path = `projects/${activeProject.id}/documents/${docId}`;
    try {
      await deleteDoc(doc(db, 'projects', activeProject.id, 'documents', docId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const createQuotation = async (
    quote: Omit<QuotationRequest, 'id' | 'projectId' | 'ownerId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!user || !activeProject) return;
    const qId = makeId('quote');
    const path = `projects/${activeProject.id}/quotations/${qId}`;
    try {
      await setDoc(doc(db, 'projects', activeProject.id, 'quotations', qId), {
        projectId: activeProject.id,
        ownerId: user.uid,
        roleCategory: quote.roleCategory.trim().slice(0, 60),
        providerName: quote.providerName.trim().slice(0, 120),
        scopeSummary: quote.scopeSummary.trim().slice(0, 1500),
        budgetRange: quote.budgetRange.trim().slice(0, 80),
        quotedAmountInr: Math.max(0, Math.min(500000000, Number(quote.quotedAmountInr || 0))),
        timelineWeeks: Math.max(0, Math.min(520, Math.round(quote.timelineWeeks || 0))),
        status: quote.status,
        notes: (quote.notes || '').trim().slice(0, 1000),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const updateQuotation = async (
    quoteId: string,
    updates: Pick<QuotationRequest, 'providerName' | 'quotedAmountInr' | 'timelineWeeks' | 'status' | 'notes'>
  ) => {
    if (!activeProject) return;
    const path = `projects/${activeProject.id}/quotations/${quoteId}`;
    try {
      await updateDoc(doc(db, 'projects', activeProject.id, 'quotations', quoteId), {
        providerName: updates.providerName.trim().slice(0, 120),
        quotedAmountInr: Math.max(0, Math.min(500000000, Number(updates.quotedAmountInr || 0))),
        timelineWeeks: Math.max(0, Math.min(520, Math.round(updates.timelineWeeks || 0))),
        status: updates.status,
        notes: (updates.notes || '').trim().slice(0, 1000),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteQuotation = async (quoteId: string) => {
    if (!activeProject) return;
    const path = `projects/${activeProject.id}/quotations/${quoteId}`;
    try {
      await deleteDoc(doc(db, 'projects', activeProject.id, 'quotations', quoteId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const saveConversation = async (
    conv: Omit<AiConversation, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ): Promise<string> => {
    if (!user) throw new Error('Sign in required.');
    const convId = existingId || makeId('conv');
    const path = `ai_conversations/${convId}`;
    const boundedMessages = conv.messages.slice(-40).map((m) => ({
      role: m.role,
      text: m.text.slice(0, 6000),
      createdAt: m.createdAt,
    }));
    try {
      if (existingId) {
        await updateDoc(doc(db, 'ai_conversations', convId), {
          title: conv.title.trim().slice(0, 140),
          language: conv.language,
          projectId: (conv.projectId || '').slice(0, 128),
          messages: boundedMessages,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(doc(db, 'ai_conversations', convId), {
          ownerId: user.uid,
          projectId: (conv.projectId || '').slice(0, 128),
          title: conv.title.trim().slice(0, 140),
          language: conv.language,
          messages: boundedMessages,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      return convId;
    } catch (err) {
      handleFirestoreError(err, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
    }
  };

  const deleteConversation = async (convId: string) => {
    const path = `ai_conversations/${convId}`;
    try {
      await deleteDoc(doc(db, 'ai_conversations', convId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const upsertMaterial = async (item: MaterialItem) => {
    const id = item.id || makeId('mat');
    try {
      await setDoc(doc(db, 'materials', id), {
        category: item.category.slice(0, 60),
        name: item.name.slice(0, 120),
        summary: item.summary.slice(0, 2000),
        types: item.types.slice(0, 1000),
        applications: item.applications.slice(0, 1000),
        qualitySpecs: item.qualitySpecs.slice(0, 1000),
        indianStandards: item.indianStandards.slice(0, 300),
        pros: item.pros.slice(0, 1000),
        cons: item.cons.slice(0, 1000),
        brandExamples: item.brandExamples.slice(0, 600),
        indicativePrice: item.indicativePrice.slice(0, 160),
        priceLocation: item.priceLocation.slice(0, 120),
        priceDate: item.priceDate.slice(0, 40),
        sourceType: item.sourceType,
        manufacturerNotes: item.manufacturerNotes.slice(0, 800),
        supplierNotes: item.supplierNotes.slice(0, 800),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `materials/${id}`);
    }
  };

  const upsertProduct = async (item: ProductItem) => {
    const id = item.id || makeId('prod');
    try {
      await setDoc(doc(db, 'products', id), {
        category: item.category.slice(0, 60),
        brand: item.brand.slice(0, 80),
        name: item.name.slice(0, 120),
        productType: item.productType.slice(0, 80),
        grade: item.grade.slice(0, 60),
        specs: item.specs.slice(0, 800),
        indicativePriceInr: Number(item.indicativePriceInr || 0),
        unit: item.unit.slice(0, 40),
        priceLocation: item.priceLocation.slice(0, 120),
        qualityDocsNote: item.qualityDocsNote.slice(0, 400),
        pros: item.pros.slice(0, 600),
        cons: item.cons.slice(0, 600),
        suitableFor: item.suitableFor.slice(0, 400),
        sourceType: item.sourceType,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${id}`);
    }
  };

  const upsertDirectoryProfile = async (item: DirectoryProfile) => {
    const id = item.id || makeId('dir');
    try {
      await setDoc(doc(db, 'directory_profiles', id), {
        role: item.role,
        name: item.name.slice(0, 120),
        district: item.district.slice(0, 80),
        specialization: item.specialization.slice(0, 200),
        experienceNote: item.experienceNote.slice(0, 500),
        verificationLabel: item.verificationLabel,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `directory_profiles/${id}`);
    }
  };

  const seedStarterCatalogs = async () => {
    for (const m of DEFAULT_MATERIALS) {
      await upsertMaterial(m);
    }
    for (const p of DEFAULT_PRODUCTS) {
      await upsertProduct(p);
    }
    for (const d of DEFAULT_DIRECTORY_PROFILES) {
      await upsertDirectoryProfile(d);
    }
  };

  const submitPublicInquiry = async (payload: {
    name: string;
    email: string;
    district: string;
    message: string;
  }) => {
    const id = makeId('inq');
    try {
      await setDoc(doc(db, 'inquiries', id), {
        name: payload.name.trim().slice(0, 100),
        email: payload.email.trim().slice(0, 160),
        district: payload.district.trim().slice(0, 80),
        message: payload.message.trim().slice(0, 1500),
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `inquiries/${id}`);
    }
  };

  return (
    <SensuryContext.Provider
      value={{
        user,
        authReady,
        isAdmin,
        profile,
        privateInfo,
        projects,
        activeProject,
        setActiveProjectId,
        tasks,
        expenses,
        progressUpdates,
        documents,
        quotations,
        conversations,
        materials,
        products,
        directoryProfiles,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        resetPassword,
        logout,
        updateUserProfile,
        toggleSavedMaterial,
        saveProject,
        updateProjectProgress,
        deleteProject,
        createTask,
        updateTaskStatus,
        deleteTask,
        createExpense,
        deleteExpense,
        createProgressUpdate,
        deleteProgressUpdate,
        createDocumentRecord,
        updateDocumentStatus,
        deleteDocumentRecord,
        createQuotation,
        updateQuotation,
        deleteQuotation,
        saveConversation,
        deleteConversation,
        upsertMaterial,
        upsertProduct,
        upsertDirectoryProfile,
        seedStarterCatalogs,
        submitPublicInquiry,
      }}
    >
      {children}
    </SensuryContext.Provider>
  );
}

export function useSensury(): SensuryContextValue {
  const ctx = useContext(SensuryContext);
  if (!ctx) {
    throw new Error('useSensury must be used inside SensuryProvider');
  }
  return ctx;
}
