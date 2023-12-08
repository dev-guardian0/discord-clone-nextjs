import { useDiscordContext } from '@/contexts/DiscordContext';
import { UserObject } from '@/model/UserObject';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useChatContext } from 'stream-chat-react';

type FormState = {
  serverName: string;
  serverImage: string;
  users: UserObject[];
};

const CreateServerForm = () => {
  console.log('[CreateServerForm]');

  // Check if we are shown
  const params = useSearchParams();
  const showCreateServerForm = params.get('createServer');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  // Data
  const { client } = useChatContext();
  const { createServer } = useDiscordContext();
  const initialState: FormState = {
    serverName: '',
    serverImage: '',
    users: [],
  };

  const [formData, setFormData] = useState<FormState>(initialState);
  const [users, setUsers] = useState<UserObject[]>([]);

  const loadUsers = useCallback(async () => {
    const response = await fetch('/api/users');
    const data = (await response.json())?.data as UserObject[];
    if (data) setUsers(data);
  }, []);

  useEffect(() => {
    if (showCreateServerForm && dialogRef.current) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [showCreateServerForm]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <dialog
      className='absolute py-16 px-20 z-10 space-y-8 rounded-xl serverDialog'
      ref={dialogRef}
    >
      <Link href='/' className='absolute right-8 top-8'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='w-8 h-8 text-gray-500 hover:text-black hover:font-bold'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
          />
        </svg>
      </Link>
      <h2 className='text-3xl font-bold text-gray-600'>Create new server</h2>
      <form method='dialog' action={createClicked} className='flex flex-col'>
        <label className='labelTitle' htmlFor='serverName'>
          Server Name
        </label>
        <input
          type='text'
          id='serverName'
          name='serverName'
          value={formData.serverName}
          onChange={(e) =>
            setFormData({ ...formData, serverName: e.target.value })
          }
          required
        />
        <label className='labelTitle' htmlFor='serverImage'>
          Image URL
        </label>
        <input
          type='text'
          id='serverImage'
          name='serverImage'
          value={formData.serverImage}
          onChange={(e) =>
            setFormData({ ...formData, serverImage: e.target.value })
          }
          required
        />
        <h2 className='mb-2 labelTitle'>Add Users</h2>
        {users.map((user) => (
          <div
            key={user.id}
            className='flex items-center justify-start w-full space-x-6 my-2'
          >
            <input
              type='checkbox'
              id={user.id}
              name={user.id}
              className='w-4 h-4 mb-0'
              onChange={() => {}}
            ></input>
            <label
              className='w-full flex items-center space-x-6'
              htmlFor='users'
            >
              {user.image && (
                <Image
                  src={user.image}
                  width={40}
                  height={40}
                  alt={user.name}
                  className='w-8 h-8 rounded-full'
                />
              )}
              {!user.image && (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                  className='w-8 h-8'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z'
                  />
                </svg>
              )}
              <p>
                <span className='block text-gray-600'>{user.name}</span>
                {user.lastOnline && (
                  <span className='text-sm text-gray-400'>
                    Last online: {user.lastOnline.split('T')[0]}
                  </span>
                )}
              </p>
            </label>
          </div>
        ))}

        <button
          type='submit'
          className='bg-discord rounded p-3 text-white font-bold uppercase'
        >
          Create
        </button>
      </form>
    </dialog>
  );

  function createClicked() {
    createServer(client, formData.serverName, formData.serverImage);
    setFormData(initialState);
    router.replace('/');
  }
};
export default CreateServerForm;
