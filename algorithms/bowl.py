from collections import Counter
from multiprocessing import Pool, cpu_count
import random
import string
import timeit
import os
import numpy as np
#import matplotlib.pyplot as plt

def get_str(n):
    """ https://stackoverflow.com/questions/16308989/fastest-method-to-generate-big-random-string-with-lower-latin-letters """
    min_lc = ord(b'a')
    len_lc = 26
    ba = bytearray(os.urandom(n))
    for i, b in enumerate(ba):
        ba[i] = min_lc + b % len_lc # convert 0..255 to 97..122
    return ba.decode("utf-8")

def benchmark_range(searcher, bowl, range_, printfreq=100):
    times = []
    last = 0
    
    for i in range_:
        message = get_str(i)
        start_time = timeit.default_timer()
        result = searcher.search(message)
        elapsed = timeit.default_timer() - start_time
        
        if i // printfreq > last:
            last = i // printfreq
            print("{}(N={}, M={}) returned {} in {:f} seconds".format(
            searcher.__class__.__name__, len(message), len(bowl), result, elapsed))
    
        times.append(elapsed)
        
    return times

def chunks(l, n):
    """Yield successive n-sized chunks from l.
    https://stackoverflow.com/questions/312443/how-do-you-split-a-list-into-evenly-sized-chunks"""
    for i in range(0, len(l), n):
        yield l[i:i + n]
        
def normalize(arr):
    arr = np.array(arr)
    return (arr-min(arr))/(max(arr)-min(arr))

def countfn(x):
    return Counter(x)


class Searcher:

    def __init__(self, bowl):
        self.bowl = bowl

    def preprocess(self):
        pass

    def search(self):
        pass

class NaiveSearcher(Searcher):

    def search(self, message):
        already_picked = []

        def findletter_naive(l):
            for idx,i in enumerate(self.bowl):
                if i == l and idx not in already_picked:
                    already_picked.append(idx)
                    return True
            else:
                return False

        return all(findletter_naive(i) for i in message)

class CounterSearcher(Searcher):
    
    def __init__(self, bowl):
        super(CounterSearcher, self).__init__(bowl)
        self.counts = Counter(self.bowl)
        
    def search(self, message):
        found = Counter()

        for letter in message:
            letters_in_bowl = self.counts[letter]
            if letters_in_bowl > found[letter]:
                found[letter] += 1
            else:
                return False

        return True
    
class CounterSearcherNoPreprocess(CounterSearcher):

    def search(self, message):
        self.counts = Counter(self.bowl)
        return super(CounterSearcherNoPreprocess, self).search(message)
    
class CounterSearcherParalell(CounterSearcher):

    def __init__(self, bowl):
        super(CounterSearcherParalell, self).__init__(bowl)
        print("Creating process pool for {} processing cores.".format(cpu_count()))
        self.pool = Pool(cpu_count())

    def search(self, message):

        chunk_size = len(self.bowl) // cpu_count()

        #map
        parts = self.pool.map(countfn, list(chunks(self.bowl, chunk_size)))
        self.counts = None
        
        #reduce
        for p in parts:
            if self.counts == None:
                self.counts = p
            else:
                self.counts += p
                
        return super(CounterSearcherParalell, self).search(message)
    
class RandomSearcher(Searcher):
    
    def search(self, message):
        already_picked = []

        def findletter_random(l):
            start = np.random.choice(len(self.bowl))
            for idx, i in enumerate(self.bowl[start: len(self.bowl)]):
                if i == l and idx+start not in already_picked:
                    already_picked.append(idx+start)
                    return True
            for idx, i in enumerate(self.bowl[0: start]):
                if i == l and idx not in already_picked:
                    already_picked.append(idx)
                    return True
            return False
        
        return all(findletter_random(i) for i in message)

bowl = get_str(1000000)

naive = NaiveSearcher(bowl)    
naive_times = benchmark_range(naive, bowl, range(1,1000,10))

counter = CounterSearcher(bowl)
counter_times = benchmark_range(counter, bowl, range(1,1000,10))

counter_pre = CounterSearcherNoPreprocess(bowl)
counter_pre_times = benchmark_range(counter_pre, bowl, range(1,1000,10))

counter_paralell = CounterSearcherParalell(bowl)
counter_paralell_times = benchmark_range(counter_paralell, bowl, range(1,1000,10))

random = RandomSearcher(bowl)
random_times = benchmark_range(random, bowl, range(1,1000,10))

#plt.plot(naive_times)
#plt.plot(counter_times)
#plt.plot(counter_pre_times)
#plt.plot(counter_paralell_times)
#plt.plot(random_times)
#plt.show()
